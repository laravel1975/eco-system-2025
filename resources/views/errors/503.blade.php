<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Under Maintenance - Ticket MA App</title>

    <style>
        :root {
            /* [ปรับแต่ง] 1. สีพื้นหลัง (จาก Landing Page) */
            --bg-color: linear-gradient(180deg, #f8f9fe 0%, #f9faff 100%);
            --card-bg: #ffffff;

            /* [ปรับแต่ง] 2. สีแบรนด์ (สีม่วง/อินดิโก จากปุ่ม Log In) */
            --brand-color: #4f46e5;

            /* [ปรับแต่ง] 3. สีข้อความ (จาก Landing Page) */
            --text-color-primary: #111827; /* สีเข้ม (Headline) */
            --text-color-secondary: #6b7280; /* สีเทา (Body text) */

            /* [ปรับแต่ง] 4. เงา (จาก Landing Page) */
            --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* รองรับ Dark Mode (เผื่อไว้) */
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: linear-gradient(180deg, #1f2937 0%, #111827 100%);
                --card-bg: #374151;
                --text-color-primary: #f9fafb;
                --text-color-secondary: #d1d5db;
                --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            }
        }

        body {
            /* [ปรับแต่ง] ใช้ฟอนต์ที่สะอาดตาเหมือนใน Landing Page */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            background-image: var(--bg-color);
            background-attachment: fixed;
            color: var(--text-color-primary);
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 1.5rem;
            box-sizing: border-box;
        }

        /* [ปรับแต่ง] ใช้สไตล์การ์ดจาก Landing Page */
        .card-container {
            background-color: var(--card-bg);
            border-radius: 1.5rem; /* ขอบมนมากๆ เหมือนในรูป */
            box-shadow: var(--card-shadow);
            max-width: 500px;
            width: 100%;
            padding: 3rem 2.5rem;
            box-sizing: border-box;
        }

        .icon-wrapper {
            margin-bottom: 1.5rem;
        }

        /* [ปรับแต่ง] ไอคอน SVG รูปเฟือง และใช้สีแบรนด์ */
        .icon-wrapper svg {
            width: 4rem;
            height: 4rem;
            color: var(--brand-color); /* 👈 ใช้สีแบรนด์ */
            animation: spin 6s linear infinite;
            margin: auto;
        }

        /* [ปรับแต่ง] Headline หลัก */
        h1 {
            font-size: 1.875rem; /* 30px */
            font-weight: 700; /* Bold */
            color: var(--text-color-primary);
            margin: 0 0 1rem 0;
        }

        /* [ปรับแต่ง] เพิ่มชื่อแอป และใช้สีแบรนด์ */
        p.app-name {
            font-size: 1.25rem; /* 20px */
            font-weight: 600;
            color: var(--brand-color); /* 👈 ใช้สีแบรนด์ */
            margin: 0 0 1.5rem 0;
        }

        /* [ปรับแต่ง] ข้อความรอง (สีเทา) */
        p.body-text {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--text-color-secondary);
            margin: 0;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
    </style>
</head>
<body>
    <div class="card-container">

        <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        </div>

        <h1>We'll be right back</h1>

        <p class="app-name">
            Ticket MA App is updating.
        </p>

        <p class="body-text">
            We are currently performing scheduled maintenance.
            The service will be back online shortly. Thank you for your patience!
        </p>

    </div>
</body>
</html>
