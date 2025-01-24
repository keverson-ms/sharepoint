import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EficientrometroWebPartStrings';
import Eficientrometro from './components/Eficientrometro';
import { IEficientrometroProps } from './components/IEficientrometroProps';
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
export interface IEficientrometroWebPartProps {
  title: string;
  background: string;
  title_size: number;
  titleAlignCenter: boolean;
  color: boolean;
}

export default class EficientrometroWebPart extends BaseClientSideWebPart<IEficientrometroWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IEficientrometroProps> = React.createElement(
      Eficientrometro,
      {
        title: this.properties.title = (this.properties.title ?? 'Eficientrômetro CSC'),
        title_size: this.properties.title_size = (this.properties.title_size ?? 3),
        color: this.getContrastColor(this.properties.background ?? this.domElement.style.getPropertyValue('--link')) === 'black' ? true : false,
        background: this.properties.background = (this.properties.background ?? this.domElement.style.getPropertyValue('--link')),
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    this.domElement.style.setProperty('--background-valores', this.properties.background);
    this.domElement.style.setProperty('--text-valores', this.getContrastColor(this.properties.background));
    this.domElement.style.setProperty('--title-size', `${this.properties.title_size}em`);
    this.domElement.style.setProperty('--text-align-center', `${this.properties.titleAlignCenter ? 'center' : 'left'}`);

    ReactDom.render(element, this.domElement);

    this.animateCounterUp();
  }

  private animateCounterUp(): void {
    const elements = this.domElement.querySelectorAll(".counter-up");

    elements.forEach((element: Element) => {
      console.log(element.getAttribute("data-value"), 'Keverson');
      const text = element.getAttribute("data-value") ?? "0";

      // Conversão de formato brasileiro para americano
      const value = parseFloat(text.replace(/\./g, "").replace(",", "."));

      if (!isNaN(value)) {
        const startValue = 0;
        const duration = 10000; // Duração da animação em milissegundos
        let startTime: number | null = null;

        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const currentValue = startValue + (value - startValue) * progress;

          // Formatar número no formato brasileiro
          const formattedValue = (value % 1 === 0)
            ? Math.ceil(currentValue).toLocaleString("pt-BR")
            : currentValue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

          element.textContent = formattedValue;

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    });
  }

  protected onPropertyChange(propertyPath: string, newValue: string): void {

    if (propertyPath === "background") {
      this.domElement.style.setProperty('--background-valores', newValue);
      this.domElement.style.setProperty('--text-valores', this.getContrastColor(`${this.properties.background}`));
    }

    if (propertyPath === "title_size") {
      this.domElement.style.setProperty('--title-size', `${this.properties.title_size}em`);
    }

    if (propertyPath === "titleAlignCenter") {
      this.domElement.style.setProperty('--text-align-center', `${this.properties.titleAlignCenter ? 'center' : 'left'}`);
    }

    this.properties.color = (this.getContrastColor(this.properties.background ?? this.domElement.style.getPropertyValue('--link')) === 'black' ? true : false);
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
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
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
