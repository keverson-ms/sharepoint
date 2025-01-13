import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'CarouselSplideWebPartStrings';
import CarouselSplide from './components/CarouselSplide';
import { ICarouselSplideProps } from './components/ICarouselSplideProps';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react';
import { SPHttpClient } from '@microsoft/sp-http';
export interface ICarouselSplideWebPartProps {
  description: string;
  items: IFilePickerResult[];
  title: string;
  perPage: number;
  autoplay: boolean;
  rewind: boolean;
  type: string;
  direction: string;
  padding: number;
}

export default class CarouselSplideWebPart extends BaseClientSideWebPart<ICarouselSplideWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private minPerPage: number = 1;
  private maxPerPage: number = 5;

  public render(): void {
    const element: React.ReactElement<ICarouselSplideProps> = React.createElement(
      CarouselSplide,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        title: this.properties.title,
        perPage: this.properties.perPage,
        autoplay: this.properties.autoplay,
        rewind: this.properties.rewind,
        type: this.properties.type,
        direction: this.properties.direction,
        padding: this.properties.padding,
      },
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {

    if (this.properties.type === 'fade') this.properties.perPage = this.minPerPage;
    if (!this.properties.perPage) this.properties.perPage = this.minPerPage;
    if (!this.properties.padding) this.properties.padding = 0;

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
                PropertyFieldCollectionData("items", {
                  key: "items",
                  saveBtnLabel: "Salvar",
                  cancelBtnLabel: "Cancelar",
                  saveAndAddBtnLabel: "Salvar e adicionar",
                  label: "Itens a serem exibidos",
                  panelHeader: "Painel de Gerenciamento de Informações",
                  manageBtnLabel: "Gerenciar dados",
                  value: this.properties.items,
                  fields: [
                    {
                      id: "Titulo",
                      title: "Titulo",
                      type: CustomCollectionFieldType.string,
                      required: true,
                    },
                    {
                      id: "Imagem",
                      title: "Selecione Imagem",
                      type: CustomCollectionFieldType.custom,
                      onCustomRender: (field, value, onUpdate, item, itemId, onError) => {
                        return (
                          React.createElement("div", { style: { display: "flex", alignItems: "center" } },
                            React.createElement(FilePicker, {
                              context: this.context,
                              key: itemId,
                              buttonLabel: "Selecione uma Imagem",
                              onSave: async (filePickerResult: IFilePickerResult[]) => {
                                let fileUrl = filePickerResult[0].fileAbsoluteUrl;

                                if (!fileUrl && filePickerResult[0].fileName) {
                                  try {
                                    const uploadUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/GetFolderByServerRelativeUrl('/SiteAssets')/Files/add(url='${filePickerResult[0].fileName}', overwrite=true)`;

                                    const uploadedFile = await this.context.spHttpClient.post(
                                      uploadUrl,
                                      SPHttpClient.configurations.v1,
                                      {
                                        body: filePickerResult[0].fileName
                                      }
                                    );

                                    const jsonResponse = await uploadedFile.json();

                                    console.log('uploadedFile: ' + jsonResponse, 'fileName' + filePickerResult[0].fileName, 'URL Absoluto: ' + this.context.pageContext.web.absoluteUrl);

                                    // Monta a URL do arquivo carregado
                                    // fileUrl = `${this.context.pageContext.web.absoluteUrl}${jsonResponse.ServerRelativeUrl}`;
                                  } catch (error) {
                                    console.error("Erro ao enviar o arquivo:", error);
                                    onError(itemId, "Erro ao carregar a imagem. Tente novamente.");
                                    return;
                                  }
                                }

                                onUpdate(field.id, filePickerResult[0].previewDataUrl);
                                return Event;
                              },
                              accepts: [".gif", ".jpg", ".jpeg", ".bmp", ".dib", ".tif", ".tiff", ".ico", ".png", ".jxr", ".svg"]
                            }),
                            value &&
                            React.createElement("div", /* { style: { marginTop: "10px" } } */ null,
                              React.createElement("a", {
                                href: value,
                                target: "_blank",
                                rel: "noopener noreferrer"
                              },
                                React.createElement("img", {
                                  src: value,
                                  alt: "Pré-visualização da imagem",
                                  style: { maxWidth: "50px", maxHeight: "100%", display: "block", margin: "0.5em" }
                                })
                              )
                            )
                          )
                        );
                      },
                      required: true
                    },
                  ]
                }),
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                  value: this.properties.title
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true,
                  rows: 5,
                  value: this.properties.description
                }),
                PropertyPaneDropdown('type', {
                  label: strings.TypeFieldLabel,
                  options: [
                    { key: 'loop', text: 'Loop' },
                    { key: 'fade', text: 'Fade' },
                  ],
                  selectedKey: 'loop'
                }),
                PropertyPaneToggle('direction', {
                  label: strings.DirectionFieldLabel,
                  checked: false,
                  onText: strings.DirectionOnText,
                  offText: strings.DirectionOffText,
                  onAriaLabel: 'rtl',
                  offAriaLabel: 'ltr'
                }),
                PropertyPaneCheckbox('autoplay', {
                  text: strings.AutoPlayFieldLabel,
                  checked: this.properties.autoplay
                }),
                PropertyPaneCheckbox('rewind', {
                  text: strings.RewindFieldLabel,
                  checked: this.properties.rewind
                }),
                PropertyPaneSlider('perPage', {
                  min: this.minPerPage,
                  max: this.properties.type === 'fade' ? this.minPerPage : this.maxPerPage,
                  value: this.properties.perPage,
                  label: strings.PerPageFieldLabel,
                  disabled: this.properties.type === 'fade',
                }),
                PropertyPaneSlider('padding', {
                  min: 0,
                  max: 5,
                  value: this.properties.padding,
                  label: strings.PaddingFieldLabel,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
