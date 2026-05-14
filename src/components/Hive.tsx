interface HiveProps {
  letters: string[]
  centerLetter: string
  onLetterClick: (letter: string) => void
}

// Bal peteği düzeni: merkez + 6 çevre pozisyonu
// Hexagon boyutuna göre offset hesaplanır
const POSITIONS = [
  { row: 0, col: 0 }, // merkez
  { row: -1, col: -0.5 }, // sol üst
  { row: -1, col: 0.5 }, // sağ üst
  { row: 0, col: -1 }, // sol
  { row: 0, col: 1 }, // sağ
  { row: 1, col: -0.5 }, // sol alt
  { row: 1, col: 0.5 }, // sağ alt
]

function HexButton({
  letter,
  isCenter,
  onClick,
  style,
}: {
  letter: string
  isCenter: boolean
  onClick: () => void
  style: React.CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        absolute flex items-center justify-center
        w-[var(--hex-size)] h-[var(--hex-size)]
        text-2xl sm:text-3xl font-bold uppercase
        select-none cursor-pointer
        transition-transform duration-100 active:scale-90
        ${
          isCenter
            ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }
      `}
      style={{
        ...style,
        clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
      }}
    >
      {letter}
    </button>
  )
}

export default function Hive({ letters, centerLetter, onLetterClick }: HiveProps) {
  // letters[0] = centerLetter, letters[1..6] = çevre harfler
  const orderedLetters = [
    letters[0],
    ...letters.slice(1),
  ]

  return (
    <div
      className="relative mx-auto"
      style={{
        '--hex-size': 'clamp(56px, 15vw, 80px)',
        '--hex-gap': '4px',
        width: 'calc(var(--hex-size) * 3 + var(--hex-gap) * 2)',
        height: 'calc(var(--hex-size) * 2.5 + var(--hex-gap) * 2)',
      } as React.CSSProperties}
    >
      {orderedLetters.map((letter, i) => {
        const pos = POSITIONS[i]
        // Hex center offset: her hexagon boyutu + gap kadar kaydır
        // row offset: hex yüksekliğinin 0.75 katı (hexagonlar iç içe geçer)
        const left = `calc(50% + ${pos.col} * (var(--hex-size) + var(--hex-gap)) - var(--hex-size) / 2)`
        const top = `calc(50% + ${pos.row * 0.75} * (var(--hex-size) + var(--hex-gap)) - var(--hex-size) / 2)`

        return (
          <HexButton
            key={letter}
            letter={letter}
            isCenter={letter === centerLetter}
            onClick={() => onLetterClick(letter)}
            style={{ left, top }}
          />
        )
      })}
    </div>
  )
}
