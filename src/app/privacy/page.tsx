import SubVisual from '@/components/ui/SubVisual';
import PrivacyText from '@/components/legal/PrivacyText';

export default async function PrivacyPage() {
  return (
    <div id="contents">
        <SubVisual  
        tit1="개인정보 처리방침" 
        tit2="개인정보 처리방침" 
        tit3="개인정보 처리방침" 
        ></SubVisual>
        <div className="section">
            <PrivacyText />
        </div>
    </div>
  );
}