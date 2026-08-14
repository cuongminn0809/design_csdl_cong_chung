import { Construction } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-1 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-foreground-strong">
        {title}
      </h1>
      <p className="mb-6 text-sm text-foreground-muted">
        Màn hình này chưa được tái dựng từ thiết kế gốc.
      </p>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Construction className="size-8 text-foreground-subtle" />
          <div className="text-sm text-foreground-muted">
            Sắp triển khai — tham khảo file thiết kế tương ứng trong{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
              design_handoff_kho_csdlcc/screens
            </code>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
