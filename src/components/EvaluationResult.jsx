import React from 'react';
import { Award, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

const EvaluationResult = ({ result }) => {
    const { score, feedback, better_translation } = result;

    // Determine color based on score
    let scoreColor = 'text-red-500';
    let progressColor = 'bg-red-500';
    let icon = <XCircle className="w-8 h-8 text-red-500" />;

    if (score >= 80) {
        scoreColor = 'text-teal-600';
        progressColor = 'bg-teal-500';
        icon = <CheckCircle className="w-8 h-8 text-teal-600" />;
    } else if (score >= 50) {
        scoreColor = 'text-orange-500'; // Using Orange as a warning color, NOT golden yellow
        progressColor = 'bg-orange-500';
        icon = <Award className="w-8 h-8 text-orange-500" />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-slate-50 rounded-full">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Evaluation Result</h3>
                        <p className="text-slate-500 text-sm">Here's how you did</p>
                    </div>
                    <div className="ml-auto text-right">
                        <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
                        <span className="text-slate-400 text-lg">/100</span>
                    </div>
                </div>

                {/* Custom Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden">
                    <div
                        className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                            <Lightbulb className="w-4 h-4 text-indigo-600" />
                            Feedback
                        </h4>
                        <p className="text-slate-700 leading-relaxed">
                            {feedback}
                        </p>
                    </div>

                    {better_translation && (
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <h4 className="flex items-center gap-2 font-semibold text-indigo-900 mb-2">
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                                Better Translation
                            </h4>
                            <p className="text-indigo-800 font-medium italic">
                                "{better_translation}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationResult;
