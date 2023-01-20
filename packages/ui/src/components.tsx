import { useState } from "react"

export type DemoComponentProps = {}

export const DemoComponent = (props: DemoComponentProps) => {
    const [state, setState] = useState<string | null>(null);
    return (
        <input value={state || ""} onChange={(e) => setState(e.target.value || null)} />
    )
}