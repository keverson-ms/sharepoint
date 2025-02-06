import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EficientrometroWebPartStrings';
import Eficientrometro from './components/Eficientrometro';
import { IEficientrometroCollectionDataProps, IEficientrometroProps } from './components/IEficientrometroProps';
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { TextField } from "office-ui-fabric-react/lib/TextField";

export interface IEficientrometroWebPartProps {
  title: string;
  background: string;
  title_size: number;
  titleAlignCenter: boolean;
  color: boolean;
  items: IEficientrometroCollectionDataProps[] | [];
  year: string;
  totalHoras: string;
  totalValores: string;
}

export default class EficientrometroWebPart extends BaseClientSideWebPart<IEficientrometroWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {

    const element: React.ReactElement<IEficientrometroProps> = React.createElement(
      Eficientrometro,
      {
        title: this.properties.title = (this.properties.title ?? 'Eficientômetro CSC'),
        title_size: this.properties.title_size = (this.properties.title_size ?? 3),
        color: this.getContrastColor(this.properties.background ?? this.domElement.style.getPropertyValue('--link')) === 'black' ? true : false,
        background: this.properties.background = (this.properties.background ?? this.domElement.style.getPropertyValue('--link')),
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        year: this.properties.year = (this.properties.year ?? (new Date().getFullYear().toString())),
        items: this.properties.items = (this.properties.items ?? []),
        totalHoras: this.properties.totalHoras = this.properties.totalHoras ?? this.getHoras(),
        totalValores: this.properties.totalValores = this.properties.totalValores ?? this.getValores(),
      }
    );

    this.domElement.style.setProperty('--background-valores', this.properties.background);
    this.domElement.style.setProperty('--text-valores', this.getContrastColor(this.properties.background));
    this.domElement.style.setProperty('--title-size', `${this.properties.title_size}em`);
    this.domElement.style.setProperty('--text-align-center', `${this.properties.titleAlignCenter ? 'center' : 'left'}`);

    ReactDom.render(element, this.domElement);
    this.animateCounterUp();
  }

  protected getHoras(): string {

    const horas = this.properties.items?.filter((item: { ano: string }) => {
      return this.properties.year === item.ano;
    }).map((item: { horas: number }) => item.horas)
      .reduce((a: number, b: number) => Number(a) + Number(b), 0);

    return horas.toString();
  }

  protected getValores(): string {
    const valores = this.properties.items
      ?.filter((item: { ano: string; valor: string | number }) => this.properties.year === item.ano)
      .map((item: { valor: string | number }) => {
        const valorString = typeof item.valor === 'string' ? item.valor : item.valor.toString();
        const valorNumerico = parseFloat(valorString.replace(/[^\d,]/g, '').replace(',', '.'));

        return isNaN(valorNumerico) ? 0 : valorNumerico;
      })
      .reduce((a: number, b: number) => a + b);

    return this.numberFormat(valores.toString());
  }


  private animateCounterUp(): void {
    const elements = this.domElement.querySelectorAll(".counter-up");

    return elements.forEach((element: Element) => {
      setTimeout(() => {
        const value = parseFloat(element.getAttribute('data-value')?.toString() || '0');
        element.textContent = value.toString();

        if (!isNaN(value)) {
          const startValue = 0;
          const duration = 10000; // Duração da animação em milissegundos
          let startTime: number | null = null;

          const animate = (currentTime: number) => {
            if (!startTime) {
              startTime = currentTime;
            }

            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentValue = startValue + (value - startValue) * progress;

            const formattedValue = (value % 1 === 0) && !element.getAttribute('data-money')
              ? Math.ceil(currentValue).toLocaleString("pt-BR").replace('.', '')
              : (currentValue).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

            element.textContent = formattedValue;

            if (progress < 1) {
              return requestAnimationFrame(animate);
            }
          };
          return requestAnimationFrame(animate);
        }
      }, 250);
    });
  }

  protected async onPropertyChange(propertyPath: string, oldValue: string, newValue: string): Promise<void> {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    if (propertyPath === "background" && newValue !== oldValue) {
      this.domElement.style.setProperty('--background-valores', newValue);
      this.domElement.style.setProperty('--text-valores', this.getContrastColor(`${this.properties.background}`));
    }

    if (propertyPath === "title_size" && newValue !== oldValue) {
      this.domElement.style.setProperty('--title-size', `${this.properties.title_size}em`);
    }

    if (propertyPath === "titleAlignCenter" && newValue !== oldValue) {
      this.domElement.style.setProperty('--text-align-center', `${this.properties.titleAlignCenter ? 'center' : 'left'}`);
    }

    this.properties.color = (this.getContrastColor(this.properties.background ?? this.domElement.style.getPropertyValue('--link')) === 'black' ? true : false);
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: string, newValue: string): void {

    if (propertyPath === "year" && newValue !== oldValue) {
      this.properties.year = newValue;
    }

    if (propertyPath !== 'background') {
      this.properties.totalHoras = this.getHoras();
      this.properties.totalValores = this.getValores();
    }
  }

  protected async onInit(): Promise<void> {

    await super.onInit();

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

  private getContrastColor(backgroundColor: string): string {
    const luminance = this.getLuminance(backgroundColor);

    return luminance > 0.5 ? 'black' : 'white';
  }

  private getLuminance(color: string): number {
    if (color[0] === '#') color = color.slice(1);

    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);

    const a = [r, g, b].map(function (v) {
      v /= 255;
      return (v <= 0.03928) ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
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


  protected getYears(): { key: string, text: string }[] {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear; i >= 2023; i--) {
      years.push(i);
    }

    years.unshift(currentYear + 1);

    const yearOptions = years.map(year => ({
      key: year.toString(),
      text: year.toString()
    }));

    return yearOptions;
  }

  protected numberFormat(money: string): string {
    const numericValue = money.replace(/[^\d.]/g, '').replace(',', '.');

    const parsedValue = parseFloat(numericValue);

    return parsedValue.toString();
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
                  label: "Gerenciar dados",
                  panelHeader: "Painel de Gerenciamento de Informações",
                  manageBtnLabel: "Adicionar / Alterar / Remover",
                  value: this.properties.items,
                  fields: [
                    {
                      id: "titulo",
                      title: "Título",
                      type: CustomCollectionFieldType.string,
                      required: true,
                    },
                    {
                      id: "ano",
                      title: "Ano de Referência",
                      type: CustomCollectionFieldType.dropdown,
                      required: true,
                      options: this.getYears(),
                    },
                    {
                      id: "horas",
                      title: "Horas",
                      type: CustomCollectionFieldType.number,
                      placeholder: 'Ganho de Produtividade Operacional',
                      required: true,

                    },
                    {
                      id: "valor",
                      title: "Valor",
                      type: CustomCollectionFieldType.custom,
                      placeholder: 'Economia gerada (acumulada)',
                      required: true,
                      onCustomRender: (field, value, onUpdate, item, itemId, onError) => {
                        return React.createElement(TextField, {
                          key: itemId,
                          value: value || "",
                          onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {

                            if (newValue) {
                              const numericValue = newValue.replace(/[^\d]/g, "");
                              const parsedValue = parseFloat(numericValue);

                              if (parsedValue < 0) {
                                onError(field.id, "O valor não pode ser negativo");
                              } else {
                                onError(field.id, "");

                                const maskedValue = new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(parsedValue / 100);
                                const value = maskedValue.replace(/[^\d]/g, "") ? maskedValue : "";

                                onUpdate(field.id, value);
                              }
                            }
                          },
                        });
                      },
                    },
                  ],
                  disabled: false,
                }),
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                }),
                PropertyPaneSlider('title_size', {
                  label: strings.TitleSizeFieldLabel,
                  min: 2,
                  max: 4,
                  value: this.properties.title_size
                }),
                PropertyPaneToggle('titleAlignCenter', {
                  label: 'Alinhar título ao centro',
                  checked: this.properties.titleAlignCenter
                }),
                PropertyPaneDropdown('year', {
                  label: 'Exibir dados do ano de: ',
                  options: this.getYears(),
                  selectedKey: this.properties.year,
                }),
                PropertyFieldColorPicker('background', {
                  label: 'Cor de Fundo dos valores',
                  selectedColor: `${this.properties.background}`,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 500,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'background',
                  showPreview: true,
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
