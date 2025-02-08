interface BoxData {
    backgroundColor: string;
    textSize: number;
    text: string;
    textColor: string;
}

interface GridDisplayProps {
    boxes: BoxData[];
}

export default function GridDisplay({ boxes }: GridDisplayProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {boxes.map((box, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: box.backgroundColor,
                        color: box.textColor,
                        fontSize: `${box.textSize}px`,
                    }}
                    className="p-4 rounded min-h-[100px] flex items-center justify-center text-center"
                >
                    {box.text}
                </div>
            ))}
        </div>
    );
}
