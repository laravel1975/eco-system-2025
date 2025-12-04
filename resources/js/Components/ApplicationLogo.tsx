import { LayoutGridIcon } from 'lucide-react';
import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <LayoutGridIcon className='w-6 h-6 text-slate-500 hover:scale-105 hover:text-slate-300'/>
    );
}
