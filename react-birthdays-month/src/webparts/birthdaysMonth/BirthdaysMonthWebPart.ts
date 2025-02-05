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

export interface IBirthdaysMonthWebPartProps {
  title: string;
  messageDefault: boolean;
  group: string;
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
  private defaultOverflow = 500;
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
        title: this.properties.title = (this.properties.messageDefault || !this.properties.title ? (this.properties.title = 'Aniversariantes do Mês - ' + getMonth().replace(/^\w/, (c) => c.toUpperCase())) : this.properties.title),
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        members: this.properties.members ?? [],
        group: this.properties.group,
        absoluteUrl: `${this.context.pageContext.web.absoluteUrl}`,
        overflow: this.properties.overflow = (this.properties.overflow ?? this.defaultOverflow),
        webPartContext: this.context,
        msGraph: this.msGraphProvider,
        caracteres: this.properties.caracteres = (this.properties.caracteres ?? this.minCaracteres)
      }
    );

    this.domElement.style.setProperty('--overflow', `${this.properties.overflow ?? this.defaultOverflow}px`);
    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    this._groupOptions = await this.msGraphProvider._fetchGroups(this.context);

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
                PropertyPaneTextField('title', {
                  label: strings.TitleSectionFieldLabel,
                  value: this.properties.title,
                  disabled: this.properties.messageDefault
                }),
                PropertyPaneDropdown('group', {
                  label: strings.GroupAzureFieldLabel,
                  options: this._groupOptions.length > 0 ? this._groupOptions : [{ key: '', text: 'Carregando...' }],
                  selectedKey: `${this.properties.group}`,
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

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: string, newValue: string): Promise<void> {
    if (this.properties.group) {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }

    if (propertyPath === "overflow" && newValue !== oldValue) {
      this.domElement.style.setProperty('--overflow', `${this.properties.overflow ?? 0}px`);
    }

    if (this.properties.group && propertyPath === 'group' && newValue !== oldValue) {
      this.properties.group = `${newValue}`;
      this.properties.members = await this.msGraphProvider._fetchGroupMembers(newValue, this.context);
      this.render();
    }
  }

}
