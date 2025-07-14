import React from 'react';
import PropTypes from 'prop-types';
import QuestionItem from './QuestionItem';

export default function QuestionList({ questions, onChange }) {
  const updateQuestion = (idx, patch) =>
    onChange(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const removeQuestion = idx =>
    onChange(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
      {questions.map((q, i) => (
        <QuestionItem
          key={q.id}
          index={i}
          data={q}
          total={questions.length}
          onChange={updateQuestion}
          onRemove={removeQuestion}
        />
      ))}
    </div>
  );
}

QuestionList.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange : PropTypes.func.isRequired
};
