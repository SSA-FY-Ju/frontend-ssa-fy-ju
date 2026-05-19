'use client';

/**\n * 파일 역할: 채팅 입력 단계에서 태어난 시간 입력과 빠른 선택 버튼 UI를 제공합니다.\n */

interface TimePickerFieldProps {
  birthTime: string;
  onChange: (time: string) => void;
  onSubmit: (time: string) => void;
}

const quickTimes = ['12:00', '00:00', '06:00', '18:00'];

export default function TimePickerField({ birthTime, onChange, onSubmit }: TimePickerFieldProps) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-t border-slate-700 space-y-3">
      <input
        type="time"
        value={birthTime}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
      />

      <div className="text-xs text-gray-400 mb-2">빠른 입력:</div>
      <div className="grid grid-cols-4 gap-2">
        {quickTimes.map((time) => (
          <button
            key={time}
            onClick={() => onChange(time)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              birthTime === time
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSubmit(birthTime)}
        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-4"
      >
        확인
      </button>
    </div>
  );
}
