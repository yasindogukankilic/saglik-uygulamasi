import { useEffect, useState } from 'react';

export const useQuiz = (questionList = []) => {
  const [qs,   setQs]   = useState(questionList);
  const [idx,  setIdx]  = useState(0);
  const [ans,  setAns]  = useState([]);   // kullanıcının seçimleri
  const [done, setDone] = useState(false);

  /* soru listesi yenilendiğinde sıfırla */
  useEffect(() => {
    setQs(questionList);
    setIdx(0);
    setAns([]);
    setDone(false);
  }, [questionList]);

  /* seçim kaydet */
  const select = (choice) =>
    setAns(a => { const n=[...a]; n[idx]=choice; return n; });

  const next = () => {
    if (idx < qs.length - 1) setIdx(i => i + 1);
    else setDone(true);
  };

  /* sonuç */
  const total   = qs.length;
  const correct = ans.filter(
    (sel,i)=>sel === (qs[i].correctAnswer ?? qs[i].correct)
  ).length;
  const wrong   = total - correct;
  const score   = Math.round((correct/total)*100);

  return {
    questions : qs,
    index     : idx,
    currentQ  : qs[idx],
    selected  : ans[idx] ?? null,
    finished  : done,
    select,
    next,
    result    : { total, correct, wrong, score }
  };
};
