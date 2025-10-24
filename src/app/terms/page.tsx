import SubVisual from '@/components/ui/SubVisual';
import UseOfTermsText from '@/components/legal/UseOfTermsText';

export default async function TermsPage() {
  return (
    <div id="contents">
        <SubVisual  
        tit1="이용 약관" 
        tit2="이용 약관" 
        tit3="이용 약관" 
        ></SubVisual>
        <div className="section">
            <UseOfTermsText />
        </div>
    </div>
  );
}