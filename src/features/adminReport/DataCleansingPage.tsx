import { CLEANSING_ROWS } from "./config"
import { ProcessReportPage } from "./ProcessReportPage"

export function DataCleansingPage() {
  return (
    <ProcessReportPage
      title="Báo cáo làm sạch dữ liệu"
      desc="Theo dõi kết quả làm sạch dữ liệu: loại bỏ trùng lặp, chuẩn hóa định dạng và xử lý lỗi."
      rows={CLEANSING_ROWS}
      codeLabel="Mã tiến trình"
      exportLabel="LamSachDuLieu.xlsx"
    />
  )
}
