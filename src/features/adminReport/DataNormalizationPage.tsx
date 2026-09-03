import { NORMALIZATION_ROWS } from "./config"
import { ProcessReportPage } from "./ProcessReportPage"

export function DataNormalizationPage() {
  return (
    <ProcessReportPage
      title="Báo cáo chuẩn hóa dữ liệu"
      desc="Theo dõi kết quả chuẩn hóa dữ liệu: quy đổi mã danh mục, cấu trúc trường theo mô hình dữ liệu chuẩn."
      rows={NORMALIZATION_ROWS}
      codeLabel="Mã tiến trình"
      exportLabel="ChuanHoaDuLieu.xlsx"
    />
  )
}
