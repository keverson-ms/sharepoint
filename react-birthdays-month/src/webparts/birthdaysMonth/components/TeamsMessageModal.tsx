import * as React from 'react';
import { mergeStyleSets, DefaultButton, FocusTrapZone, Layer, Overlay, Popup } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import styles from './BirthdaysMonth.module.scss';
import { IBirthdaysMembersItem } from './IBirthdaysMonthProps';

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

export const TeamsMessageModal: React.FunctionComponent<{ member: IBirthdaysMembersItem }> = ({ member }) => {

  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

  const [message, setMessage] = React.useState<string>('');

  const handleSendMessage = () => {
    // Aqui você pode adicionar o código para enviar a mensagem via Teams, por exemplo
    console.log('Mensagem enviada:', message);
    hidePopup(); // Fechar o modal após o envio
  };

  return (
    <>
      <DefaultButton className={styles.bgTeams} iconProps={{ iconName: 'TeamsLogo', color: 'green' }} onClick={showPopup} />
      {isPopupVisible && (
        <Layer>
          <Popup
            className={popupStyles.root}
            role="dialog"
            aria-modal="true"
            onDismiss={hidePopup}
          >
            <Overlay onClick={hidePopup} />
            <FocusTrapZone forceFocusInsideTrap={true} className={styles.focusTrap}>
              <div role="messageTeams" className={popupStyles.content}>
                <h2>Parabenize <span className={styles.colorTheme}>{member.displayName.split(' - ').shift()}!</span></h2>
                <div>
                  <p>
                    Escreva uma mensagem para enviar via Teams:
                  </p>
                  <textarea
                    placeholder="Digite sua mensagem ..."
                    className={styles.messageTeams}
                    value={message}
                    rows={10}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <hr className={styles.my2} />
                <div className={`${styles.dflex} ${styles.justifyContentSpaceBetween}`}>
                  <DefaultButton className='btnDanger' onClick={hidePopup} iconProps={{ iconName: 'ChromeClose' }}>Fechar</DefaultButton>
                  <DefaultButton className='btnSucess' onClick={handleSendMessage} iconProps={{ iconName: 'Send' }}>Enviar</DefaultButton>
                </div>
              </div>
            </FocusTrapZone>
          </Popup>
        </Layer>
      )}
    </>
  );
};
