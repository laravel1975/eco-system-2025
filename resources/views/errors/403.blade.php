<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Access Denied - Ticket MA App</title>

    <style>
        :root {
            /* 1. สีพื้นหลัง (จาก Landing Page) */
            --bg-color: linear-gradient(180deg, #f8f9fe 0%, #f9faff 100%);
            --card-bg: #ffffff;

            /* 2. สีแบรนด์ (สีม่วง/อินดิโก จากปุ่ม Log In) */
            --brand-color: #4f46e5;
            --brand-color-darker: #4338ca; /* (สำหรับ Hover) */

            /* 3. สีข้อความ */
            --text-color-primary: #111827;
            --text-color-secondary: #6b7280;

            /* 4. เงา (จาก Landing Page) */
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

        /* ใช้สไตล์การ์ดจาก Landing Page */
        .card-container {
            background-color: var(--card-bg);
            border-radius: 1.5rem; /* ขอบมนมากๆ */
            box-shadow: var(--card-shadow);
            max-width: 500px;
            width: 100%;
            padding: 3rem 2.5rem;
            box-sizing: border-box;
        }

        .icon-wrapper {
            margin-bottom: 1.5rem;
        }

        /* ไอคอน SVG รูป "กุญแจล็อก" และใช้สีแบรนด์ */
        .icon-wrapper svg {
            width: 4rem;
            height: 4rem;
            color: var(--brand-color); /* 👈 ใช้สีแบรนด์ */
            margin: auto;
        }

        h1 {
            font-size: 1.875rem; /* 30px */
            font-weight: 700;
            color: var(--text-color-primary);
            margin: 0 0 1rem 0;
        }

        /* 403 Headline */
        p.headline {
            font-size: 1.25rem; /* 20px */
            font-weight: 600;
            color: var(--brand-color); /* 👈 ใช้สีแบรนด์ */
            margin: 0 0 1.5rem 0;
        }

        /* ข้อความรอง (สีเทา) */
        p.body-text {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--text-color-secondary);
            margin: 0;
        }

        /* [เพิ่ม] สไตล์ปุ่ม (เหมือนปุ่ม Log In) */
        .btn {
            display: inline-block;
            background-color: var(--brand-color);
            color: #ffffff;
            font-weight: 600;
            font-size: 0.875rem;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            margin-top: 2rem;
            transition: background-color 0.2s ease-in-out;
        }

        .btn:hover {
            background-color: var(--brand-color-darker);
        }
    </style>
</head>
<body>
    <div class="card-container">

        <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        </div>

        <h1>Access Denied</h1>

        <p class="headline">
            403 Forbidden
        </p>

        <p class="body-text">
            Sorry, you do not have the necessary permissions to access this page.
            Please contact your administrator if you believe this is an error.
        </p>

        <a href="/" class="btn">Go to Dashboard</a>

    </div>
</body>
</html>
