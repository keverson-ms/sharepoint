import * as React from 'react';
import { mergeStyleSets, DefaultButton, FocusTrapZone, Layer, Overlay, Popup, MessageBar, MessageBarType } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import styles from './BirthdaysMonth.module.scss';
import { IBirthdaysMembersItem } from './IBirthdaysMonthProps';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import msGraphProvider from '../../services/msGraphProvider';

const popupStyles = mergeStyleSets({
  root: {
    background: 'rgba(0, 0, 0, 0.2)',
    bottom: '0',
    left: '0',
    position: 'fixed',
    right: '0',
    top: '0',
  },
  content: {
    background: 'white',
    left: '50%',
    width: '35%',
    maxWidth: '35%',
    padding: '2em 2em',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

export const TeamsMessageModal: React.FunctionComponent<{ member: IBirthdaysMembersItem, props: WebPartContext, msGraph: msGraphProvider, caracteres: number }> = ({ member, props, msGraph, caracteres }) => {

  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
  const [message, setMessage] = React.useState<string>('');
  const [charCount, setCharCount] = React.useState<number>(0);
  const [notification, setNotification] = React.useState<{ type: MessageBarType, text: string } | null>(null);

  const handleSendMessage = async () => {
    const messageToSend = message.trim().replace(/\s{3,}/g, ' ');

    try {

      await msGraph.sendBirthdayMessage(member.mail, props, messageToSend);

      setMessage('');
      hidePopup();
      setNotification({ type: MessageBarType.success, text: '🎉 Mensagem enviada com sucesso!' });
    } catch (error) {
      setMessage(messageToSend);
      setNotification({ type: MessageBarType.error, text: '❌ Erro ao enviar mensagem.' });
    }

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };
  console.log(member);
  return (
    <>
      {notification && (
        <MessageBar messageBarType={notification.type} onDismiss={() => setNotification(null)}>
          {notification.text}
        </MessageBar>
      )}

      <DefaultButton className={styles.bgTeams} iconProps={{ iconName: 'TeamsLogo', color: 'green' }} onClick={showPopup} />

      {isPopupVisible && (
        <Layer>
          <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
            <Overlay onClick={hidePopup} />
            <FocusTrapZone forceFocusInsideTrap={true} className={styles.focusTrap}>
              <div role="messageTeams" className={popupStyles.content}>
                <h2>Parabenize <span className={styles.colorTheme}>{member.displayName.split(' - ').shift()}!</span></h2>
                <div>
                  <p>Escreva uma mensagem para enviar via Teams:</p>
                  <textarea
                    placeholder="Digite sua mensagem ..."
                    className={styles.messageTeams}
                    value={message}
                    rows={5}
                    onChange={(e) => {
                      const text = e.target.value;
                      setMessage(text.replace(/\s{3,}/g, ' '));
                      setCharCount(text.replace(/\s{3,}/g, ' ').length); // Atualiza o contador com base no número de caracteres
                    }}
                  />
                </div>
                <p className={`${styles.colorTheme} ${styles.fontWeightBold} ${styles.m0}`}>{charCount} / minímo de {caracteres} caracteres</p>
                <hr className={styles.my2} />
                <div className={`${styles.dflex} ${styles.justifyContentSpaceBetween}`}>
                  <DefaultButton className='btnDanger' onClick={hidePopup} iconProps={{ iconName: 'ChromeClose' }}>Fechar</DefaultButton>
                  <DefaultButton className='btnSucess' onClick={handleSendMessage} iconProps={{ iconName: 'Send' }} disabled={message.replace(/\s{3,}/g, ' ').length < caracteres}>Enviar</DefaultButton>
                </div>
              </div>
            </FocusTrapZone>
          </Popup>
        </Layer>
      )}
    </>
  );
};
