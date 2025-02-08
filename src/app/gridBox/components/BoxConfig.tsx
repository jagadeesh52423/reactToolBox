interface BoxConfigProps {
    index: number;
    config: {
        backgroundColor: string;
        textSize: number;
        text: string;
        textColor: string;
    };
    onChange: (data: BoxConfigProps['config']) => void;
}

export default function BoxConfig({ index, config, onChange }: BoxConfigProps) {
    return (
        <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Box {index + 1}</h3>
            <div className="space-y-2">
                <div>
                    <label className="block text-sm">Background Color:</label>
                    <input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                        className="border p-1 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm">Text Size:</label>
                    <input
                        type="number"
                        value={config.textSize}
                        onChange={(e) => onChange({ ...config, textSize: parseInt(e.target.value) })}
                        className="border p-1 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm">Text:</label>
                    <input
                        type="text"
                        value={config.text}
                        onChange={(e) => onChange({ ...config, text: e.target.value })}
                        className="border p-1 w-full rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm">Text Color:</label>
                    <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => onChange({ ...config, textColor: e.target.value })}
                        className="border p-1 w-full rounded"
                    />
                </div>
            </div>
        </div>
    );
}
