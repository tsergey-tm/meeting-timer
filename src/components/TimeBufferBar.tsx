import React from 'react';
import {formatTimeToMinutes} from "../utils/timeUtils.ts";
import {useTranslation} from "react-i18next";

export interface TimeBufferBarProps {
    currentSeconds: number; // Текущий остаток времени в буфере (может быть < 0)
    totalBuffer: number;    // Максимальный (полный) объем буфера в секундах
    yellowAt: number;       // Порог желтой зоны в секундах (например, 2400)
    orangeAt: number;       // Порог оранжевой зоны в секундах (например, 1200)
}

export const TimeBufferBar: React.FC<TimeBufferBarProps> = ({
                                                                currentSeconds,
                                                                totalBuffer,
                                                                yellowAt,
                                                                orangeAt
                                                            }) => {
    const {t} = useTranslation();

    // 1. Динамический минимум оставшегося времени (если ушли в просрочку, он падает ниже нуля)
    const displayMin = Math.min(0, currentSeconds);

    // Полный временной диапазон шкалы на экране
    const totalScaleRange = totalBuffer - displayMin;

    // 2. Вычисляем ширину зон слева направо (от "целого буфера" к "сгоревшему")
    const greenWidth = ((totalBuffer - yellowAt) / totalScaleRange) * 100;
    const yellowWidth = ((yellowAt - orangeAt) / totalScaleRange) * 100;
    const orangeWidth = (orangeAt / totalScaleRange) * 100;

    // 3. Вычисляем позицию указателя сжигания (0% - слева, 100% - справа)
    // Формула считает, сколько секунд из буфера мы уже "сожгли"
    const burnedSeconds = totalBuffer - currentSeconds;
    const pointerPosition = Math.min(
        Math.max(0, (burnedSeconds / totalScaleRange) * 100),
        100
    );

    const isOverdue = currentSeconds < 0; // Буфер полностью сгорел, ушли в минус
    const isUntouched = currentSeconds >= totalBuffer; // Буфер не тронут (или даже увеличен)

    return (
        <div
            className="w-full font-sans select-none pt-4 pb-4 pl-8 pr-8 bg-slate-50 rounded-lg">

            <div className="text-center pb-2">{t("TimeBufferBar.buffer")}</div>
            {/* Контейнер шкалы и маркера */}
            <div className="relative pb-7">

                {/* УКАЗАТЕЛЬ СЖИГАНИЯ (Движется слева направо) */}
                <div
                    className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-10"
                    style={{
                        left: `${pointerPosition}%`,
                        transition: 'left 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                >
                    {/* Вертикальная линия-игла */}
                    <div className={`w-1 h-8 rounded-full transition-colors duration-300 bg-slate-800`}/>
                    {/* Плашка под маркером */}
                    <div
                        className={`px-2 py-0.5 text-xs font-bold rounded shadow-sm text-white mb-1 transition-colors duration-300 ${
                            isOverdue ? 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]' : isUntouched ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}>
                        {formatTimeToMinutes(currentSeconds)}
                    </div>
                </div>

                {/* ГОРИЗОНТАЛЬНЫЙ БАР (Слева направо: Зеленый -> Желтый -> Оранжевый -> Красный) */}
                <div
                    className="w-full h-6 rounded-lg overflow-hidden flex shadow-inner bg-slate-200 border border-slate-300/50">

                    {/* Зеленая зона (Буфер почти полон) */}
                    <div
                        className="h-full bg-emerald-500 border-r border-emerald-600/20"
                        style={{
                            width: `${greenWidth}%`,
                            transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    />

                    {/* Желтая зона */}
                    <div
                        className="h-full bg-amber-400 border-r border-amber-500/20"
                        style={{
                            width: `${yellowWidth}%`,
                            transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    />

                    {/* Оранжевая зона */}
                    <div
                        className="h-full bg-orange-500 border-r border-orange-600/20"
                        style={{
                            width: `${orangeWidth}%`,
                            transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    />

                    {/* Красная зона (Буфер исчерпан + сюда же рендерится область просрочки) */}
                    <div className="h-full bg-rose-600 flex-1 transition-all duration-300"/>

                </div>
            </div>
        </div>
    );
};
