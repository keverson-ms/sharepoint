import { IBirthdaysMembersGroupsItem, IBirthdaysMembersItem } from '../birthdaysMonth/components/IBirthdaysMonthProps';
import { AadHttpClient, HttpClientResponse, MSGraphClientFactory } from '@microsoft/sp-http';

export default class msGraphProvider extends MSGraphClientFactory {

    public context: any;

    public constructor(context: any) {
        console.log(context);
        super();
        this.context = context;
    }

    private async _getAadHttpClient(context: any): Promise<AadHttpClient> {
        return context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    }

    public async _fetchGroups(context: any): Promise<IBirthdaysMembersGroupsItem[]> {
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

    public async _fetchGroupMembers(groupId: string, context: any): Promise<IBirthdaysMembersItem[]> {

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
                dateBirthExtension: isValidDate(member.officeLocation) ? formatDateToPortuguese(member.officeLocation) : null,
                preferredLanguage: member.preferredLanguage,
                surname: member.surname,
                userPrincipalName: member.userPrincipalName
            } : null));

            return members;
        }

        return [];
    }
}