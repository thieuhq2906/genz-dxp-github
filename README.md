# Thư mời GenZ DXP — GitHub Pages

Website HTML/CSS/JavaScript thuần, không cần npm hoặc bước build.

## Sửa nội dung nhanh

Mở **config.json** bằng trình soạn thảo UTF-8:

- `meta`: tên tab trình duyệt, mô tả và ngôn ngữ.
- `text.header`, `text.intro`, `text.chat-scene`, `text.invite`, `text.success`, `text.footer`: toàn bộ chữ trên các màn hình, kể cả nút, ngày giờ, tên nhóm, số thành viên và chú thích ảnh.
- `chat.messages`: tên người gửi, chữ avatar (`initials`), nội dung (`text`), `me: true` để hiện tin ở bên phải.
- Các trường còn lại trong `chat`: trạng thái phát và nhãn nút điều khiển.
- `rsvp.taunts`: lời nhắc khi nút Không chạy đi.
- `accessibility`: nhãn cho trình đọc màn hình.
- `images`: đường dẫn ảnh và mô tả thay thế.

Mỗi mục trong `text` là một mảng các đoạn chữ. Chỉ sửa nội dung trong dấu ngoặc kép, giữ nguyên tên khóa, số phần tử và khoảng trắng đầu/cuối nếu có. Các đoạn được ngăn bởi xuống dòng hoặc chữ in đậm nằm ở những phần tử riêng để giữ đúng bố cục. Có thể tìm nhanh chữ đang hiển thị bằng Ctrl+F. Chữ được chèn an toàn bằng textContent; không viết HTML trong JSON. Ngày, giờ và địa điểm xuất hiện nhiều nơi: tìm và sửa tất cả chỗ tương ứng.

Sau khi sửa, lưu rồi tải lại trang. Nếu sai JSON, trang hiển thị thông báo lỗi. Nội dung trong index.html chỉ là bản dự phòng; chỉnh config.json là đủ khi trang chạy qua HTTP.

## Chạy thử trên máy

Trong thư mục này, chạy:

```sh
python3 -m http.server 8000
```

Mở http://localhost:8000. Không mở index.html bằng file:// vì trình duyệt chặn fetch JSON.

## Đưa lên GitHub cá nhân

1. Tạo repository mới, ví dụ `genz-dxp-invite`.
2. Đưa toàn bộ **nội dung bên trong thư mục này** lên nhánh `main`. Đảm bảo `index.html` nằm ngay ở gốc repository, cùng config.json và thư mục assets.
3. Trong repository, mở **Settings → Pages**.
4. Source: **Deploy from a branch**; Branch: **main**; thư mục **/(root)**; Save.
5. Chờ GitHub hoàn tất triển khai. Trang có địa chỉ `https://TEN-GITHUB.github.io/genz-dxp-invite/`.

Các đường dẫn đều tương đối, dùng được với repository con hoặc repository TEN-GITHUB.github.io. Các lần cập nhật sau chỉ cần commit và push. Không cần token/API key trong mã nguồn.

Tài liệu: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Ảnh và font

Tất cả tài nguyên ảnh được tham chiếu bằng .svg. Ảnh chụp và logo hiện có được giữ nguyên dưới dạng WebP đã nén nhúng trong SVG, không phải vector hóa. Cách này giữ nguyên khuôn mặt và chữ logo; SVG không làm ảnh chụp nhẹ hơn WebP trực tiếp, và base64 làm kích thước tệp thô tăng khoảng 33%. Ảnh phía dưới dùng lazy loading. Không tải thư viện hay font từ CDN.

Font DejaVu Serif được lưu cục bộ để giữ dấu tiếng Việt. Giữ FONT-LICENSE.txt khi phân phối.

Nút Không còn 70% sau 4 lượt né và tiếp tục chạy; nút Có mở màn hình xác nhận. Đây là hiệu ứng phía trình duyệt, không gửi hoặc lưu RSVP lên máy chủ.
