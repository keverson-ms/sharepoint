import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IBirthdaysMembersGroupsItem, IBirthdaysMembersItem } from '../birthdaysMonth/components/IBirthdaysMonthProps';
import { AadHttpClient, HttpClientResponse, MSGraphClientFactory, MSGraphClientV3 } from '@microsoft/sp-http';

export default class msGraphProvider extends MSGraphClientFactory {

    private async _getAadHttpClient(context: WebPartContext): Promise<AadHttpClient> {
        return context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    }

    private async _getMSGraphClient(context: WebPartContext): Promise<MSGraphClientV3> {
        return context.msGraphClientFactory.getClient("3");
    }

    public async _fetchGroups(context: WebPartContext): Promise<IBirthdaysMembersGroupsItem[]> {
        const client = await this._getAadHttpClient(context);

        const response: HttpClientResponse = await client.get(
            "https://graph.microsoft.com/v1.0/groups?$select=id,displayName,description&$filter=((NOT groupTypes/any(c:c eq 'Unified')) and (mailEnabled eq true) and (securityEnabled eq true) and (description%20ne%20null))&$count=true&$top=999",
            AadHttpClient.configurations.v1,
            {
                headers: {
                    'ConsistencyLevel': 'eventual'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar grupos: ${response.statusText}`);
        }

        const data = await response.json();

        const groups = data.value.map((group: { id: string; description: string; }) => ({
            key: group.id,
            text: (`${group.description}`).toUpperCase()
        }));

        return groups;
    }

    public async _fetchGroupMembers(groupId: string, context: WebPartContext): Promise<IBirthdaysMembersItem[]> {

        if (groupId) {
            const client = await this._getAadHttpClient(context);

            const response: HttpClientResponse = await client.get(
                `https://graph.microsoft.com/v1.0/groups/${groupId}/members?$count=true&$filter=(accountEnabled eq true)&$top=999`,
                AadHttpClient.configurations.v1,
                {
                    headers: {
                        'ConsistencyLevel': 'eventual'
                    }
                }
            );

            const data = await response.json();

            const isValidDate = (dateStr: string): boolean => {
                const date = new Date(dateStr);
                return !isNaN(date.getTime());
            };

            const formatDateToPortuguese = (dateStr: string): string | null => {
                if (!isValidDate(dateStr)) return null;

                const date = new Date(dateStr);

                return new Intl.DateTimeFormat('pt-BR', {
                    month: 'long',
                    day: 'numeric'
                }).format(date).replace(/^\w/, (c) => c.toUpperCase());
            };

            const members = data.value.filter((member: { officeLocation: string }) => {
                if (!isValidDate(member.officeLocation)) return false;

                const birthDate = new Date(member.officeLocation);
                const currentMonth = new Date().getMonth();

                return birthDate.getMonth() === currentMonth;
            }).sort((a: { officeLocation: string }, b: { officeLocation: string }) => {
                const dateA = new Date(a.officeLocation).getDate();
                const dateB = new Date(b.officeLocation).getDate();
                return dateA - dateB;
            }).map((member: IBirthdaysMembersItem) => (member ? {
                displayName: member.displayName,
                givenName: member.givenName,
                id: member.id,
                jobTitle: member.jobTitle,
                mail: member.mail,
                mobilePhone: member.mobilePhone,
                officeLocation: member.officeLocation,
                dateBirth: isValidDate(member.officeLocation) ? member.officeLocation : null,
                dayBirthExtension: isValidDate(member.officeLocation) ? formatDateToPortuguese(member.officeLocation) : null,
                preferredLanguage: member.preferredLanguage,
                surname: member.surname,
                userPrincipalName: member.userPrincipalName
            } : null));

            return members;
        }

        return [];
    }

    public async sendBirthdayMessage(userId: string, context: WebPartContext, message: string): Promise<void> {
        try {
            const client = await this._getMSGraphClient(context);

            let chatId: string | null = null;

            const chatResponse = await client.api('/chats').post({
                "chatType": "oneOnOne",
                "members": [
                    {
                        "@odata.type": "#microsoft.graph.aadUserConversationMember",
                        "roles": ["owner"],
                        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${context.pageContext.user.email}`
                    },
                    {
                        "@odata.type": "#microsoft.graph.aadUserConversationMember",
                        "roles": ["owner"],
                        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${userId}`
                    }
                ]
            });

            console.log(chatResponse.id)

            chatId = chatResponse.id;

            await client.api(`/chats/${chatId}/messages`).post({
                "body": { "content": message }
            });

            console.log("Mensagem enviada com sucesso!");
        } catch (error) {
            console.error("Erro ao enviar mensagem para o Teams:", error);
        }
    }

}