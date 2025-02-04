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
    maxWidth: '400px',
    padding: '0 2em 2em',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

export const PopupModal: React.FunctionComponent<{ member: IBirthdaysMembersItem }> = ({ member }) => {
  console.log(member.displayName.split(' - ').shift());
  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

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
            <FocusTrapZone>
              <div role="document" className={popupStyles.content}>
                <h2>Parabenize <span className={styles.colorTheme}>{member.displayName.split(' - ').shift()}!</span></h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
                <hr className={styles.my2} />
                <div className={`${styles.dflex} ${styles.justifyContentSpaceBetween}`}>
                  <DefaultButton className='btnDanger' onClick={hidePopup} iconProps={{ iconName: 'ChromeClose' }}>Fechar</DefaultButton>
                  <DefaultButton className='btnSucess' onClick={hidePopup} iconProps={{ iconName: 'Send' }}>Enviar</DefaultButton>
                </div>
              </div>
            </FocusTrapZone>
          </Popup>
        </Layer>
      )}
    </>
  );
};
