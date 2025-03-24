import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BirthdaysMonthWebPartStrings';
import BirthdaysMonth from './components/BirthdaysMonth';
import { IBirthdaysMonthProps, IBirthdaysMembersItem, IBirthdaysMembersGroupsItem } from './components/IBirthdaysMonthProps';
import MsGraphProvider from '../services/msGraphProvider';
import { IFilePickerResult, PropertyFieldFilePicker } from '@pnp/spfx-property-controls';
import { SPHttpClient } from '@microsoft/sp-http';
import { FilePickerTabType } from '@pnp/spfx-property-controls/lib/propertyFields/filePicker/filePickerControls/FilePicker.types';

export interface IBirthdaysMonthWebPartProps {
  title: string;
  messageDefault: boolean;
  order: boolean;
  group: string;
  imageModal: IFilePickerResult;
  members: IBirthdaysMembersItem[];
  absoluteUrl: string;
  overflow: number;
  webPartContext: WebPartContext,
  msGraph: MsGraphProvider,
  caracteres: number
}

export default class BirthdaysMonthWebPart extends BaseClientSideWebPart<IBirthdaysMonthWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _groupOptions: IBirthdaysMembersGroupsItem[] = [];
  private defaultOverflow = 300;
  private msGraphProvider: MsGraphProvider = new MsGraphProvider();
  private minCaracteres = 10;

  public render(): void {

    const getMonth = (): string => {
      const dataAtual = new Date();

      return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataAtual);
    };

    const element: React.ReactElement<IBirthdaysMonthProps> = React.createElement(
      BirthdaysMonth,
      {
        title: this.properties.title = (this.properties.messageDefault || !this.properties.title ? (this.properties.title = 'Aniversariantes') : this.properties.title),
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        members: this.properties.members ?? [],
        group: this.properties.group,
        imageModal: this.properties.imageModal,
        absoluteUrl: `${this.context.pageContext.web.absoluteUrl}`,
        overflow: this.properties.overflow = (this.properties.overflow ?? this.defaultOverflow),
        webPartContext: this.context,
        msGraph: this.msGraphProvider,
        caracteres: this.properties.caracteres = (this.properties.caracteres ?? this.minCaracteres),
        messageDefault: this.properties.messageDefault,
        order: this.properties.order,
        month: getMonth().replace(/^\w/, (c) => c.toUpperCase())
      }
    );

    this.domElement.style.setProperty('--overflow', `${this.properties.overflow ?? this.defaultOverflow}px`);
    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    this._groupOptions = await this.msGraphProvider._fetchGroups(this.context);

    await this.onPropertyPaneFieldChanged.bind(this);

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  /**
   * Called when the component is disposed of
   * This is where we do cleanup for the component
   * @override
   */
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupFields: [
                PropertyPaneToggle('messageDefault', {
                  label: strings.MessageDefaultFieldLabel,
                  checked: this.properties.title && this.properties.messageDefault ? true : false,
                  onText: 'Sim',
                  offText: 'Não',
                  onAriaLabel: 'Y',
                  offAriaLabel: 'N'
                }),
                PropertyPaneToggle('order', {
                  label: strings.OrderFieldLabel,
                  checked: this.properties.title && this.properties.order ? true : false,
                  onText: 'Decrescente',
                  offText: 'Crescente',
                  onAriaLabel: 'Y',
                  offAriaLabel: 'N',
                }),
                PropertyPaneTextField('title', {
                  label: strings.TitleSectionFieldLabel,
                  value: this.properties.title,
                  disabled: this.properties.messageDefault,
                }),
                PropertyPaneDropdown('group', {
                  label: strings.GroupAzureFieldLabel,
                  options: this._groupOptions.length > 0 ? this._groupOptions : [{ key: '', text: 'Carregando...' }],
                  selectedKey: `${this.properties.group}`,
                }),
                PropertyFieldFilePicker('imageModal', {
                  context: this.context,
                  filePickerResult: this.properties.imageModal,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  hideOneDriveTab: true,
                  hideStockImages: true,
                  defaultSelectedTab: FilePickerTabType.SiteFilesTab,
                  onSave: async (e: IFilePickerResult) => {
                    if (e) {
                      e.fileAbsoluteUrl = `${this.context.pageContext.web.absoluteUrl}/SiteAssets/${e.fileName}`;
                      this.properties.imageModal = e;
                      await this.uploadImageModal(e);
                    }
                  },
                  onChanged: (e: IFilePickerResult) => {
                    this.properties.imageModal = e;
                  },
                  key: "deleteFile",
                  buttonLabel: "Selecione o arquivo",
                  label: "arquivo",
                  accepts: ['image/*']
                }),
                PropertyPaneSlider('overflow', {
                  label: 'Barra de Rolagem',
                  min: this.defaultOverflow,
                  max: 1000,
                  value: this.properties.overflow,
                  disabled: this.properties.group ? false : true,
                  showValue: true
                }),
                PropertyPaneSlider('caracteres', {
                  label: 'Quantidade mínima de caracteres na mensagem',
                  min: this.minCaracteres,
                  max: 1000,
                  value: this.properties.caracteres,
                  disabled: this.properties.group ? false : true,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected async uploadImageModal(filePickerResult: IFilePickerResult): Promise<void> {

    if (!filePickerResult.fileAbsoluteUrl) {
      try {
        filePickerResult.fileAbsoluteUrl = `${this.context.pageContext.web.absoluteUrl}/SiteAssets/${filePickerResult.fileName}`;
        const uploadUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/GetFolderByServerRelativeUrl('SiteAssets')/Files/add(url='${encodeURIComponent(filePickerResult.fileName)}',overwrite=true)`;

        const fileContent = await filePickerResult.downloadFileContent();

        await this.context.spHttpClient.post(
          uploadUrl,
          SPHttpClient.configurations.v1,
          {

            headers: {
              'Accept': 'application/json;odata=verbose',
              'Content-Type': 'application/octet-stream',
            },
            body: fileContent,
          }


        ).then((responseJSON) => {
          console.log('File created successfully: ', responseJSON.text());
          filePickerResult.fileAbsoluteUrl = `${this.context.pageContext.web.absoluteUrl}/SiteAssets/${filePickerResult.fileName}`;
        })
          .catch((error) => {
            console.error('Error creating file:', error);
          });

      } catch (error) {
        console.error("Erro ao tentar realizar o upload de imagem: " + error);
        return;
      }
    }
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: string, newValue: string): Promise<void> {

    if (this.properties.group) {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }

    if (propertyPath === "overflow" && newValue !== oldValue) {
      this.domElement.style.setProperty('--overflow', `${this.properties.overflow ?? 0}px`);
    }

    if (!this.properties.order || newValue !== oldValue && propertyPath === 'group') {
      console.log('group');
      this.properties.members = await this.msGraphProvider._fetchGroupMembers(this.properties.group, this.context);
      this.render();
    }

    if (this.properties.order) {
      console.log('order');
      this.properties.members = await this.msGraphProvider._fetchGroupMembers(this.properties.group, this.context);
      this.properties.members = this.properties.members.reverse();
      this.render();
    }
  }

}
