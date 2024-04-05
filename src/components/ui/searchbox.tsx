import { cn } from '@/lib/utils'
import { useState } from 'react'

export function SearchBox({ children, className, ...props }: React.ComponentPropsWithRef<'input'> & { children: React.ReactNode }) {
    return <div className={cn("group relative w-fit", className)} {...props}>
        {children}
    </div>
}

export function Trigger({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    return <div {...props}>
        {children}
    </div>
}

export function Content({ className, children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const [isChildFocus, setIsChildFocus] = useState(false)
    return <div
        tabIndex={1}
        className={cn('absolute w-full invisible group-focus-within:visible has-[*:focus]:visible  translate-y-[50px] group-focus-within:translate-y-0 has-[*:focus]:translate-y-0 transition-all duration-100 ease-linear', className)}
        style={isChildFocus ? { visibility: 'visible' } : {}}
        onBlur={(e) => {
            setIsChildFocus(e.currentTarget.contains(e.relatedTarget))
        }}
        {...props}>
        {children}
    </div>

}


SearchBox.Trigger = Trigger
SearchBox.Content = Content