<!DOCTYPE html>
<html lang="th">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Technician KPI Report</title>

    <style>

        body {
            font-family: "THSarabunNew", sans-serif; /* หรือ font-family อื่นที่รองรับไทย */
            font-size: 16px;
            line-height: 1.2;
            color: #333;
        }

        /* 2. Layout มาตรฐาน */
        .header {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
        }
        .report-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .meta-info {
            width: 100%;
            margin-bottom: 15px;
        }

        /* 3. ตารางข้อมูล */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #000; /* เส้นตารางชัดเจน */
            padding: 6px;
            text-align: left;
            vertical-align: middle;
        }
        th {
            background-color: #f0f0f0;
            text-align: center;
            font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* 4. Footer / ลายเซ็น */
        .footer {
            width: 100%;
            margin-top: 50px;
        }
        .signature-box {
            float: right;
            width: 200px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin-top: 30px;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="company-name">{{ $company->name }}</div>
        <div>รายงานประสิทธิภาพทีมช่าง (Technician Performance Report)</div>
    </div>

    <table style="border: none; margin-bottom: 10px;">
        <tr style="border: none;">
            <td style="border: none; width: 50%;">
                <strong>ช่วงเวลา:</strong> {{ $startDate }} ถึง {{ $endDate }}
            </td>
            <td style="border: none; width: 50%; text-align: right;">
                <strong>วันที่พิมพ์:</strong> {{ now()->format('d/m/Y H:i') }}
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">ชื่อ-นามสกุล (Technician)</th>
                <th style="width: 15%;">จำนวนงาน<br>(Jobs)</th>
                <th style="width: 15%;">ชั่วโมงงาน<br>(Hours)</th>
                <th style="width: 15%;">งานด่วน<br>(P1/P2)</th>
                <th style="width: 15%;">เฉลี่ย/งาน<br>(Hrs/Job)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $row)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $row['name'] }}</td>
                <td class="text-center">{{ $row['jobs'] }}</td>
                <td class="text-center">{{ number_format($row['hours'], 2) }}</td>
                <td class="text-center">{{ $row['p1'] + $row['p2'] }}</td>
                <td class="text-center">
                    {{ $row['jobs'] > 0 ? number_format($row['hours'] / $row['jobs'], 2) : '0.00' }}
                </td>
            </tr>
            @endforeach

            <tr style="background-color: #fafafa; font-weight: bold;">
                <td colspan="2" class="text-right">รวมทั้งหมด (Total)</td>
                <td class="text-center">{{ $data->sum('jobs') }}</td>
                <td class="text-center">{{ number_format($data->sum('hours'), 2) }}</td>
                <td class="text-center">{{ $data->sum('p1') + $data->sum('p2') }}</td>
                <td class="text-center">-</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>(..........................................)</div>
            <div>ผู้จัดการแผนกซ่อมบำรุง</div>
            <div>วันที่: _____/_____/_____</div>
        </div>
    </div>

</body>
</html>
