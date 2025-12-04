import { useEffect, useState, useCallback } from 'react';

/**
 * Hook สำหรับดักจับ Input จาก Barcode Scanner
 * หลักการ: Scanner จะส่ง keystrokes มาเร็วมากๆ และจบด้วย Enter
 */
export const useBarcodeScanner = (onScan: (code: string) => void) => {
    const [buffer, setBuffer] = useState('');

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // ถ้า User กำลังพิมพ์ใน Input Box อื่นอยู่ ไม่ต้องทำงาน
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'Enter') {
            if (buffer.length > 0) {
                onScan(buffer); // ส่งค่าที่สแกนได้กลับไป
                setBuffer('');  // เคลียร์ค่า
            }
        } else if (e.key.length === 1) {
            // เก็บตัวอักษรเข้า Buffer
            setBuffer(prev => prev + e.key);

            // Timeout: ถ้าพิมพ์ช้าเกินไป (คนพิมพ์) ให้เคลียร์ทิ้ง (ป้องกันการพิมพ์มั่ว)
            // Scanner ปกติจะพิมพ์เร็วกว่า 50ms ต่อตัวอักษร
            /* setTimeout(() => setBuffer(''), 100); */ // Optional: เปิดใช้ถ้าต้องการ Strict Mode
        }
    }, [buffer, onScan]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};
