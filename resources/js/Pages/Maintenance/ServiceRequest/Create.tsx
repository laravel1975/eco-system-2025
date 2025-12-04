import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppPanel from '@/Layouts/AppPanel'; // (ใช้ Layout ที่ต่างกัน)
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { AssetCombobox } from '@/Components/AssetCombobox'; // (Import)

/* --- Types --- */

// (1. 👈 [แก้ไข] Type ของ AssetOption)
interface AssetOption {
    id: number;
    name: string;
    asset_code: string;
    // (ลบ 'location' เก่า)
    // location: string | null;
    // (เพิ่ม 'warehouse' Relation ใหม่)
    warehouse: { uuid: string; name: string; } | null;
}
interface Props {
    assets: AssetOption[]; // (ใช้ Type ใหม่)
}

export default function CreateServiceRequest({ auth, assets }: PageProps & Props) {

    const { data, setData, post, processing, errors, reset } = useForm({
        asset_id: '',
        problem_description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('maintenance.service-request.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppPanel user={auth.user}>
            <Head title="แจ้งซ่อม" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <form onSubmit={submit}>
                            <CardHeader>
                                <CardTitle>แบบฟอร์มแจ้งซ่อม</CardTitle>
                                <CardDescription>
                                    กรุณาระบุเครื่องจักร/ทรัพย์สินที่มีปัญหา และอธิบายอาการ
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* (2. 👈 [แก้ไข] Asset Combobox จะแสดง 'warehouse.name' อัตโนมัติ) */}
                                <div className="space-y-2">
                                    <Label htmlFor="asset_id">เครื่องจักร / ทรัพย์สิน *</Label>
                                    <AssetCombobox
                                        assets={assets}
                                        value={String(data.asset_id)}
                                        onSelect={(value) => setData('asset_id', value || '')}
                                        placeholder="ค้นหาด้วยรหัส หรือ ชื่อเครื่องจักร..."
                                    />
                                    <InputError message={errors.asset_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="problem_description">อธิบายปัญหา *</Label>
                                    <Textarea
                                        id="problem_description"
                                        value={data.problem_description}
                                        onChange={(e) => setData('problem_description', e.target.value)}
                                        rows={5}
                                    />
                                    <InputError message={errors.problem_description} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppPanel>
    );
}
