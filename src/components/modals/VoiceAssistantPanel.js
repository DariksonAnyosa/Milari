// components/modals/VoiceAssistantPanel.js
import VoiceAssistant from '../views/VoiceAssistant';

const VoiceAssistantPanel = ({ onClose, onTaskAdded }) => {
  return (
    <div className="voice-assistant-container">
      <div className="voice-assistant-panel glass-strong">
        <VoiceAssistant 
          onClose={onClose}
          onTaskAdded={onTaskAdded}
        />
      </div>
    </div>
  );
};

export default VoiceAssistantPanel;