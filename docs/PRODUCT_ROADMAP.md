# Giftphanh product roadmap

Giftphanh là một website quà tặng cộng tác: một người tạo lọ, nhiều người viết thư, và một người nhận mở từng ngôi sao bằng liên kết cùng mật mã riêng.

## Nguyên tắc sản phẩm

- Chỉ chủ lọ cần tài khoản.
- Người viết dùng liên kết đóng góp, không cần đăng nhập và không thấy thư của người khác nếu tác giả chưa cho phép.
- Người nhận dùng liên kết riêng cùng mật mã; không thấy nội dung hoặc tên người gửi trước khi mở thư.
- Các trang quà tặng không hiển thị đăng nhập, đăng ký hoặc lời mời tạo lọ.
- Giao diện ưu tiên cảm giác thủ công, vui vẻ và giàu chuyển động; trang quản trị ưu tiên rõ ràng.

## Luồng chính

1. Chủ lọ đăng nhập từ trang chủ và tạo một lọ cho một người nhận.
2. Chủ lọ gửi liên kết viết thư vào nhóm bạn.
3. Mỗi người viết, chọn kiểu chữ, màu sao, quyền chia sẻ và mật mã sửa thư.
4. Chủ lọ duyệt thư, khóa hoặc mở lọ.
5. Người nhận nhập mật mã, mở từng ngôi sao hoặc vào màn xem tất cả ngôi sao.

## Các giai đoạn thực hiện

### 1. Dọn nền dự án và luồng cũ — hoàn thành

- Xóa skill/template clone bị lẫn vào repo.
- Giữ lại ảnh tham chiếu cần cho việc đối chiếu giao diện.
- Chuyển các trang demo `localStorage` như `/add`, `/memories`, `/welcome` về luồng sản phẩm thật.
- Đặt lối vào đăng nhập và đăng ký tại trang chủ; nút tạo lọ luôn yêu cầu đăng nhập.

### 2. Hệ chuyển động dùng chung — hoàn thành

- Tạo trường sao rơi liên tục với nhiều kích thước, tốc độ và độ sâu.
- Cho lọ và tờ giấy phía sau chuyển động nhẹ, lệch nhịp.
- Dùng hiệu ứng mạnh ở trang chủ và trang người nhận; dùng bản nhẹ ở biểu mẫu; hạn chế ở trang quản trị.
- Chỉ dùng CSS `transform` và `opacity`, đồng thời tôn trọng `prefers-reduced-motion`.

### 3. Trình soạn thư cho người gửi — hoàn thành

- Thiết kế lại tờ giấy, khoảng cách, độ tương phản và mobile.
- Việt hóa nội dung theo giọng vui vẻ, thân mật.
- Giữ giới hạn dữ liệu 10.000 ký tự và hiển thị bộ đếm từ/ký tự.
- Cho chọn một số kiểu chữ hỗ trợ tiếng Việt và xem trước ngay trên giấy.
- Giữ tên người gửi, tùy chọn ẩn danh, màu sao, quyền chia sẻ và mật mã sửa thư.
- Bổ sung một ảnh riêng tư nếu luồng lưu trữ và quyền truy cập được hoàn thiện.

Đã hoàn thiện form tờ thư, tiếng Việt vui, mobile, bộ đếm 10.000 ký tự và ba kiểu chữ có xem trước. Ảnh riêng tư được tách sang bước Storage để thiết kế đúng quyền truy cập. Migration `202607140004_memory_fonts.sql` đã được áp dụng và kiểm tra trên Supabase ngày 15/07/2026.

### 4. Trải nghiệm người nhận

- Sau khi mở khóa, chỉ hiển thị tên người nhận, chiếc lọ và nút xem tất cả ngôi sao.
- Bấm từng ngôi sao để mở thư; lúc đó mới hiện nội dung, tên người gửi và ngày.
- Thêm màn xem tất cả ngôi sao được bảo vệ bằng phiên người nhận.
- Sao đã đọc vẫn mở lại được và có trạng thái thị giác nhẹ hơn.

### 5. Tạo lọ, lịch và quản trị

- Thay bộ chọn `datetime-local` thô bằng bộ chọn ngày mở theo phong cách giấy.
- Cung cấp lựa chọn mở thủ công hoặc hẹn ngày giờ.
- Việt hóa trang tạo lọ, quản trị, duyệt thư và trạng thái trống/lỗi.
- Giữ hai liên kết người viết/người nhận tách biệt và dễ sao chép.

### 6. Dữ liệu, QA và triển khai

- Thêm `font_key` có danh sách giá trị cho phép vào thư và cập nhật các RPC liên quan.
- Thêm API/RPC tối thiểu cho màn xem tất cả sao mà không làm yếu quyền riêng tư.
- Kiểm tra desktop, mobile, bàn phím, reduced motion, phân quyền và các trạng thái rỗng/lỗi.
- Chạy `npm run check`, kiểm thử luồng thật, sau đó mới đẩy GitHub và Vercel.

## Component dự kiến

- `AmbientStarField`: nền sao dùng lại theo nhiều mức độ.
- `FloatingJarScene`: chuyển động lọ và giấy.
- `ContributorForm`: trình soạn thư thật, thay cho màn demo cũ.
- `FontPicker`: chọn và xem trước kiểu chữ.
- `PaperDatePicker`: chọn cách và thời điểm mở lọ.
- `RecipientJar`: mở từng ngôi sao.
- `RecipientStarGallery`: xem tất cả sao của người nhận.
- `LetterReveal`: hiển thị nội dung, người gửi, ngày và ảnh sau khi mở.

Không tách component cho những trường biểu mẫu chỉ dùng một lần.

## Giọng văn

- Người viết: vui và thân mật, ví dụ “Hãy viết cái gì cảm động vào đây =))))”.
- Người nhận: tình cảm, ít đùa hơn.
- Chủ lọ: trực tiếp, rõ thao tác và trạng thái.

Ví dụ nút gửi: “Gấp lại rồi thả vào lọ ★”. Ví dụ mật mã sửa thư: “Mật mã cứu nguy nếu lát nữa đọc lại thấy sến quá”.

## Điểm cần chốt trước giai đoạn dữ liệu

- Hiện mặc định giữ tối đa 10.000 ký tự cho mỗi thư.
- Trong màn xem tất cả, mặc định chỉ hiện tên và ngày sau khi người nhận mở ngôi sao để giữ bất ngờ.
- Đăng nhập/đăng ký được truy cập từ trang chủ nhưng vẫn dùng route riêng để Google OAuth ổn định.
