<?php

namespace TmrEcosystem\Approval\Domain\Services;

class ConditionChecker
{
    /**
     * @param array $conditions กฎจาก Database (JSON)
     * @param array $payload ข้อมูลจริงจากเอกสาร (e.g. ราคารวม, จำนวนวันลา)
     */
    public function check(?array $conditions, array $payload): bool
    {
        if (empty($conditions)) {
            return true; // ไม่มีเงื่อนไข = ผ่าน
        }

        foreach ($conditions as $key => $rule) {
            // ตัวอย่าง Rule: { "amount": { "operator": ">", "value": 50000 } }

            $valueToCheck = $payload[$key] ?? null;
            $operator = $rule['operator'] ?? '==';
            $threshold = $rule['value'];

            $pass = match ($operator) {
                '>' => $valueToCheck > $threshold,
                '>=' => $valueToCheck >= $threshold,
                '<' => $valueToCheck < $threshold,
                '<=' => $valueToCheck <= $threshold,
                '==' => $valueToCheck == $threshold,
                default => false,
            };

            if (!$pass) return false;
        }

        return true;
    }
}
