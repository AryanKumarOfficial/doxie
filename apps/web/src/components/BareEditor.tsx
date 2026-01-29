"use client";

import React, { Suspense, useEffect } from "react";
import type { FC } from "react";

const ReactQuill = React.lazy(() => import("react-quill-new"));

// Import Quill CSS - we need to make sure these styles are available
// when the component loads
import "react-quill-new/dist/quill.snow.css";

interface BareEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

const BareEditor: FC<BareEditorProps> = ({
    value,
    onChange,
    placeholder = "Start typing...",
    readOnly = false,
}) => {
    const handleChange = (newValue: string, _delta: any, source: string) => {
        if (source === "user") {
            onChange(newValue);
        }
    };

    return (
        <div className="editor-container min-h-[300px]">
            <Suspense fallback={<div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-md">Loading editor...</div>}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className="h-full w-full bg-white rounded-md overflow-hidden"
                    modules={{
                        toolbar: readOnly ? false : [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    }}
                    style={{ height: '250px' }}
                />
            </Suspense>
            <style jsx global>{`
                .ql-container {
                    font-size: 1rem;
                    min-height: 200px;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    background-color: #f9fafb;
                }
                .ql-editor {
                    min-height: 200px;
                }
                .ql-disabled {
                    background-color: #f9fafb;
                }
            `}</style>
        </div>
    );
};

export default BareEditor;
