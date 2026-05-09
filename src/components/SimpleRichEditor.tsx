'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatClearIcon from '@mui/icons-material/FormatClear';

interface SimpleRichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
}

export default function SimpleRichEditor({ value, onChange, placeholder, minHeight = 120 }: SimpleRichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef<string>(value);

    useEffect(() => {
        if (editorRef.current && value !== lastValueRef.current) {
            editorRef.current.innerHTML = value;
            lastValueRef.current = value;
        }
    }, [value]);

    const exec = useCallback((command: string, val?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, val);
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            lastValueRef.current = html;
            onChange(html);
        }
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            lastValueRef.current = html;
            onChange(html);
        }
    }, [onChange]);

    const FONT_SIZES = [
        { label: '작게', value: '12px' },
        { label: '보통', value: '16px' },
        { label: '크게', value: '22px' },
        { label: '매우 크게', value: '30px' },
    ];

    const applyFontSize = (size: string) => {
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = size;
            range.surroundContents(span);
            if (editorRef.current) {
                const html = editorRef.current.innerHTML;
                lastValueRef.current = html;
                onChange(html);
            }
        }
    };

    const COLORS = ['#000000', '#e53935', '#1565c0', '#2e7d32', '#f57c00', '#6a1b9a', '#00838f'];

    const applyColor = (color: string) => {
        exec('foreColor', color);
    };

    return (
        <Box sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1, overflow: 'hidden' }}>
            {/* 툴바 */}
            <Box sx={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5,
                p: 0.5, bgcolor: '#f5f5f5', borderBottom: '1px solid rgba(0,0,0,0.12)'
            }}>
                <Tooltip title="굵게 (Ctrl+B)">
                    <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}><FormatBoldIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="기울임 (Ctrl+I)">
                    <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}><FormatItalicIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="밑줄 (Ctrl+U)">
                    <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}><FormatUnderlinedIcon fontSize="small" /></IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* 글자 크기 */}
                <Tooltip title="글자 크기 (선택 후 클릭)">
                    <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'center' }}>
                        <FormatSizeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.3 }} />
                        {FONT_SIZES.map(fs => (
                            <Box
                                key={fs.value}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => applyFontSize(fs.value)}
                                sx={{
                                    cursor: 'pointer', px: 0.7, py: 0.2,
                                    fontSize: '11px', fontWeight: 'bold',
                                    borderRadius: 0.5, bgcolor: 'white',
                                    border: '1px solid rgba(0,0,0,0.2)',
                                    '&:hover': { bgcolor: '#e3f2fd' }
                                }}
                            >
                                {fs.label}
                            </Box>
                        ))}
                    </Box>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* 글자색 */}
                <Tooltip title="글자색 (선택 후 클릭)">
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <FormatColorTextIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        {COLORS.map(c => (
                            <Box
                                key={c}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => applyColor(c)}
                                sx={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    bgcolor: c, cursor: 'pointer',
                                    border: '2px solid rgba(0,0,0,0.2)',
                                    '&:hover': { transform: 'scale(1.3)', transition: '0.1s' }
                                }}
                            />
                        ))}
                    </Box>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="서식 제거">
                    <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')}><FormatClearIcon fontSize="small" /></IconButton>
                </Tooltip>
            </Box>

            {/* 편집 영역 */}
            <Box
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                data-placeholder={placeholder || '질문 내용을 입력하세요. 텍스트를 드래그하여 서식을 적용할 수 있습니다.'}
                sx={{
                    minHeight: minHeight,
                    p: 1.5,
                    outline: 'none',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    '&:empty:before': {
                        content: 'attr(data-placeholder)',
                        color: 'rgba(0,0,0,0.38)',
                        pointerEvents: 'none'
                    }
                }}
            />
        </Box>
    );
}
