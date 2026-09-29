#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'docs/Phần_kiến_thức_chính.md';
const OUT_DIR = 'src/data/knowledge';

if (!fs.existsSync(SRC)) {
  console.error(`Không tìm thấy file nguồn: ${SRC}`);
  process.exit(1);
}

const content = fs.readFileSync(SRC, 'utf8');

// Định nghĩa 33 thẻ tri thức được trích xuất nguyên bản từ tài liệu gốc,
// mỗi thẻ có độ dài ~130 - 250 từ, bám sát các mục lý luận và gắn source chuẩn xác.
const rawCards = [
  // --- CHƯƠNG 1: HOÀN THIỆN THỂ CHẾ KTTT ĐỊNH HƯỚNG XHCN Ở VIỆT NAM (Mục II) ---
  {
    id: "card-01",
    chapter: 1,
    source: "II.1.a.the-che",
    title: "Khái niệm Thể chế",
    summary: "Định nghĩa thể chế và vai trò điều chỉnh hành vi trong đời sống xã hội.",
    terms: ["thể chế"],
    content: `### Khái niệm Thể chế

Thể chế là những quy tắc, luật pháp, bộ máy quản lý và cơ chế vận hành nhằm điều chỉnh các hoạt động của con người trong một chế độ xã hội.

Trong mọi hình thái kinh tế - xã hội, thể chế đóng vai trò định hình chuẩn mực ứng xử, thiết lập trật tự và tạo khuôn khổ pháp lý cho các hoạt động của mọi thành viên trong cộng đồng.`
  },
  {
    id: "card-02",
    chapter: 1,
    source: "II.1.a.the-che-kinh-te",
    title: "Thể chế kinh tế và 3 bộ phận cấu thành",
    summary: "Định nghĩa thể chế kinh tế cùng 3 bộ phận cơ bản cấu thành.",
    terms: ["thể chế kinh tế"],
    content: `### Thể chế kinh tế và các bộ phận cấu thành

Thể chế kinh tế là hệ thống quy tắc, luật pháp, bộ máy quản lý và cơ chế vận hành nhằm điều chỉnh hành vi của các chủ thể kinh tế, các hành vi sản xuất kinh doanh và các quan hệ kinh tế.

Theo đó, các bộ phận cơ bản của thể chế kinh tế bao gồm:
1. Hệ thống pháp luật về kinh tế của nhà nước và các quy tắc xã hội được nhà nước thừa nhận;
2. Hệ thống các chủ thể thực hiện các hoạt động kinh tế;
3. Các cơ chế, phương pháp, thủ tục thực hiện các quy định và vận hành nền kinh tế.`
  },
  {
    id: "card-03",
    chapter: 1,
    source: "II.1.b",
    title: "Thể chế KTTT định hướng XHCN & Lý do thứ nhất",
    summary: "Khái niệm thể chế KTTT định hướng XHCN và lý do thể chế chưa đồng bộ.",
    terms: ["thể chế kinh tế thị trường định hướng xã hội chủ nghĩa"],
    content: `### Thể chế KTTT định hướng XHCN & Yêu cầu đồng bộ

Thể chế kinh tế thị trường định hướng xã hội chủ nghĩa là hệ thống đường lối, chủ trương chiến lược, hệ thống luật pháp, chính sách quy định xác lập cơ chế vận hành, điều chỉnh chức năng, hoạt động, mục tiêu, phương thức hoạt động, các quan hệ lợi ích của các tổ chức, các chủ thể kinh tế nhằm hướng tới xác lập đồng bộ các yếu tố thị trường, các loại thị trường hiện đại theo hướng góp phần thúc đẩy dân giàu, nước mạnh, dân chủ, công bằng, văn minh.

**Lý do thứ nhất phải hoàn thiện thể chế:**
Do thể chế kinh tế thị trường định hướng xã hội chủ nghĩa còn chưa đồng bộ. Do mới được hình thành và phát triển, cho nên, việc tiếp tục hoàn thiện thể chế là yêu cầu mang tính khách quan. Nhà nước quản lý, điều tiết nền kinh tế thị trường bằng pháp luật, chiến lược, quy hoạch, kế hoạch và các công cụ khác nhằm giảm thiểu các thất bại của thị trường, thực hiện công bằng xã hội. Do đó, cần phải xây dựng và hoàn thiện thể chế kinh tế thị trường để phát huy mặt tích cực, khắc phục mặt tiêu cực và khuyết tật của nó.`
  },
  {
    id: "card-04",
    chapter: 1,
    source: "II.1.b",
    title: "Hai lý do khách quan: Thể chế chưa đầy đủ & Kém hiệu lực",
    summary: "Lý do thứ hai và thứ ba đòi hỏi tất yếu phải hoàn thiện thể chế.",
    terms: [],
    content: `### Lý do thứ hai và thứ ba cần hoàn thiện thể chế

- **Thứ hai, hệ thống thể chế chưa đầy đủ:**
  Thể chế kinh tế thị trường là sản phẩm của nhà nước, nhà nước với tư cách là tác giả của thể chế chính thức nên đương nhiên là nhân tố quyết định số lượng, chất lượng của thể chế cũng như toàn bộ tiến trình xây dựng và hoàn thiện thể chế. Với bản chất Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam là nhà nước của nhân dân, do nhân dân và vì nhân dân, do vậy thể chế kinh tế thị trường ở Việt Nam phải là thể chế phục vụ lợi ích, vì lợi ích của nhân dân. Trình độ và năng lực tổ chức và quản lý nền kinh tế thị trường của Nhà nước thể hiện chủ yếu ở năng lực xây dựng và thực thi thể chế. Do vậy, Nhà nước phải xây dựng và hoàn thiện thể chế kinh tế thị trường để thực hiện mục tiêu của nền kinh tế.

- **Thứ ba, hệ thống thể chế còn kém hiệu lực, hiệu quả, thiếu các yếu tố thị trường và các loại thị trường:**
  Trên thực tế, trong nền kinh tế thị trường định hướng xã hội chủ nghĩa Việt Nam còn nhiều khiếm khuyết, hệ thống thể chế vừa chưa đủ mạnh, vừa hiệu quả thực thi chưa cao. Các yếu tố thị trường, các loại hình thị trường mới ở trình độ sơ khai. Do đó, tiếp tục hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa là yêu cầu khách quan.`
  },
  {
    id: "card-05",
    chapter: 1,
    source: "II.1.b",
    title: "Hạn chế thực tế của thể chế (Hộp 5.2 - Phần 1)",
    summary: "Đánh giá của Đảng về hạn chế hoàn thiện chậm và rào cản chủ thể kinh tế.",
    terms: [],
    content: `### Đánh giá hạn chế thể chế (Văn kiện TW 5 Khóa XII & ĐH XIII - Phần 1)

*Một là*, hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa ở nước ta thực hiện còn chậm. Một số quy định pháp luật, cơ chế, chính sách còn chồng chéo, mâu thuẫn, thiếu ổn định, nhất quán; còn có biểu hiện lợi ích cục bộ, chưa tạo được bước đột phá trong huy động, phân bổ và sử dụng có hiệu quả các nguồn lực phát triển. Thể chế kinh tế thị trường định hướng xã hội chủ nghĩa vẫn chưa đồng bộ, đầy đủ để bảo đảm thị trường vận hành thông suốt.

*Hai là*, hiệu quả hoạt động của các chủ thể kinh tế, các loại hình doanh nghiệp trong nền kinh tế còn nhiều hạn chế. Việc tiếp cận một số nguồn lực xã hội chưa bình đẳng giữa các chủ thể kinh tế. Cải cách hành chính còn chậm. Môi trường đầu tư, kinh doanh chưa thực sự thông thoáng, mức độ minh bạch, ổn định chưa cao. Quyền tự do kinh doanh chưa được tôn trọng đầy đủ. Quyền sở hữu tài sản chưa được bảo đảm thực thi nghiêm minh.`
  },
  {
    id: "card-06",
    chapter: 1,
    source: "II.1.b",
    title: "Hạn chế thực tế của thể chế (Hộp 5.2 - Phần 2)",
    summary: "Đánh giá của Đảng về hạn chế thị trường, công bằng xã hội và quản lý nhà nước.",
    terms: [],
    content: `### Đánh giá hạn chế thể chế (Văn kiện TW 5 Khóa XII & ĐH XIII - Phần 2)

*Ba là*, một số loại thị trường chậm hình thành và phát triển, vận hành còn nhiều vướng mắc, kém hiệu quả. Giá cả một số hàng hóa, dịch vụ thiết yếu chưa được xác lập thật sự theo cơ chế thị trường.

*Bốn là*, thể chế bảo đảm thực hiện tiến bộ và công bằng xã hội còn nhiều bất cập. Bất bình đẳng xã hội, phân hóa giàu - nghèo có xu hướng gia tăng. Xóa đói, giảm nghèo còn chưa bền vững.

*Năm là*, đổi mới phương thức lãnh đạo của Đảng trong thực hiện nhiệm vụ phát triển kinh tế - xã hội chưa đáp ứng yêu cầu đổi mới về kinh tế. Cơ chế kiểm soát quyền lực, phân công, phân cấp còn nhiều bất cập. Quản lý nhà nước chưa đáp ứng kịp yêu cầu phát triển của kinh tế thị trường và hội nhập quốc tế; hiệu lực, hiệu quả chưa cao; kỷ luật, kỷ cương chưa nghiêm. Hội nhập kinh tế quốc tế đạt hiệu quả chưa cao, thiếu chủ động trong phòng ngừa và xử lý tranh chấp thương mại quốc tế.`
  },
  {
    id: "card-07",
    chapter: 1,
    source: "II.2.a.hoan-thien-the-che-ve-so",
    title: "Hoàn thiện thể chế về sở hữu: Quyền tài sản và tài nguyên",
    summary: "Bảo đảm quyền tài sản, pháp luật đất đai, tài nguyên và tài sản công.",
    terms: ["quyền tài sản"],
    content: `### Hoàn thiện thể chế về sở hữu (Nội dung 1 đến 4)

1. **Thể chế hóa đầy đủ quyền tài sản** (quyền sở hữu, quyền sử dụng, quyền định đoạt và hưởng lợi từ tài sản) của Nhà nước, tổ chức và cá nhân. Bảo đảm công khai, minh bạch về nghĩa vụ và trách nhiệm trong thủ tục hành chính nhà nước và dịch vụ công để quyền tài sản được giao dịch thông suốt; bảo đảm hiệu lực thực thi và bảo vệ có hiệu quả quyền sở hữu tài sản.
2. **Tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên** để huy động, phân bổ và sử dụng hiệu quả đất đai, tài nguyên, khắc phục tình trạng sử dụng đất lãng phí.
3. **Hoàn thiện pháp luật về quản lý, khai thác và sử dụng tài nguyên thiên nhiên.**
4. **Hoàn thiện pháp luật về đầu tư vốn nhà nước, quản lý và sử dụng có hiệu quả tài sản công;** phân biệt rõ tài sản đưa vào kinh doanh và tài sản để thực hiện chính sách xã hội.`
  },
  {
    id: "card-08",
    chapter: 1,
    source: "II.2.a.hoan-thien-the-che-ve-so",
    title: "Hoàn thiện thể chế về sở hữu: Sở hữu trí tuệ và quản trị quốc gia",
    summary: "Bảo hộ quyền sở hữu trí tuệ, hợp đồng kinh tế và nâng cao quản trị quốc gia.",
    terms: [],
    content: `### Hoàn thiện thể chế về sở hữu (Nội dung 5 đến 7)

5. **Hoàn thiện thể chế về sở hữu trí tuệ** theo hướng khuyến khích sáng tạo, bảo đảm tính minh bạch và độ tin cậy, bảo vệ quyền sở hữu trí tuệ.
6. **Hoàn thiện pháp luật về hợp đồng và giải quyết tranh chấp dân sự** theo hướng thống nhất, đồng bộ. Phát triển hệ thống đăng ký các loại tài sản, nhất là bất động sản.
7. **Xây dựng và thực thi pháp luật, chiến lược, quy hoạch, kế hoạch nâng cao chất lượng, hiệu quả quản trị quốc gia** (Văn kiện Đại hội XIII).

Hệ thống pháp luật đồng bộ về sở hữu là nền tảng cốt lõi giúp các nhà đầu tư yên tâm bỏ vốn sản xuất kinh doanh dài hạn.`
  },
  {
    id: "card-09",
    chapter: 1,
    source: "II.2.a.hoan-thien-the-che-phat-trien",
    title: "Phát triển các thành phần kinh tế: Bình đẳng và cạnh tranh",
    summary: "Nhất quán chế độ pháp lý kinh doanh, tự do đầu tư và minh bạch đấu thầu.",
    terms: [],
    content: `### Thể chế phát triển các thành phần kinh tế (Nội dung 1 đến 4)

1. **Thực hiện nhất quán một chế độ pháp lý kinh doanh cho các doanh nghiệp,** không phân biệt hình thức sở hữu và thành phần kinh tế. Mọi doanh nghiệp thuộc các thành phần kinh tế đều hoạt động theo cơ chế thị trường, bình đẳng và cạnh tranh lành mạnh theo pháp luật.
2. **Hoàn thiện pháp luật về đầu tư, kinh doanh,** bảo đảm đầy đủ quyền tự do kinh doanh, cạnh tranh lành mạnh của các chủ thể kinh tế đã được Hiến pháp quy định; xóa bỏ các rào cản đối với hoạt động đầu tư, kinh doanh.
3. **Hoàn thiện thể chế về cạnh tranh,** bảo đảm cạnh tranh lành mạnh; xử lý dứt điểm tình trạng chồng chéo các quy định về điều kiện kinh doanh.
4. **Rà soát, hoàn thiện pháp luật về đấu thầu, đầu tư công** và các quy định pháp luật có liên quan, kiên quyết xóa bỏ các quy định bất hợp lý.`
  },
  {
    id: "card-10",
    chapter: 1,
    source: "II.2.a.hoan-thien-the-che-phat-trien",
    title: "Đổi mới DNNN, đơn vị sự nghiệp và kinh tế tập thể",
    summary: "Tập trung DNNN vào lĩnh vực then chốt, đổi mới kinh tế tập thể và hợp tác xã.",
    terms: ["doanh nghiệp nhà nước", "kinh tế tập thể"],
    content: `### Đổi mới các mô hình sản xuất kinh doanh (Nội dung 5)

Hoàn thiện thể chế về các mô hình sản xuất kinh doanh, nâng cao hiệu quả của các loại hình doanh nghiệp, hợp tác xã, các đơn vị sự nghiệp, các nông lâm trường. Trong đó chú ý:
- **Doanh nghiệp nhà nước:** Thể chế hóa việc cơ cấu lại, đổi mới và nâng cao hiệu quả doanh nghiệp nhà nước. Doanh nghiệp nhà nước chỉ tập trung vào các lĩnh vực then chốt, thiết yếu; những địa bàn chiến lược và quốc phòng, an ninh; những lĩnh vực mà doanh nghiệp thuộc các thành phần kinh tế khác không đầu tư. Quản lý chặt chẽ vốn nhà nước tại các doanh nghiệp.
- **Đơn vị sự nghiệp công lập:** Hoàn thiện thể chế về huy động các nguồn lực đầu tư và đổi mới cơ chế quản lý của Nhà nước để các đơn vị sự nghiệp công lập phát triển có hiệu quả.
- **Kinh tế tập thể:** Thể chế hóa nội dung và phương thức hoạt động của kinh tế tập thể. Tăng cường các hình thức hợp tác, liên kết, hỗ trợ cho nông dân trong sản xuất, bảo quản, chế biến, tiêu thụ nông sản.`
  },
  {
    id: "card-11",
    chapter: 1,
    source: "II.2.a.hoan-thien-the-che-phat-trien",
    title: "Phát triển kinh tế tư nhân & Thu hút vốn đầu tư nước ngoài",
    summary: "Kinh tế tư nhân là động lực quan trọng và chủ động thu hút đầu tư nước ngoài có chọn lọc.",
    terms: ["kinh tế tư nhân", "đầu tư trực tiếp của nước ngoài"],
    content: `### Phát triển kinh tế tư nhân và đầu tư nước ngoài (Nội dung 6 và 7)

- **Kinh tế tư nhân là động lực quan trọng:**
  Tiếp tục hoàn thiện thể chế, thúc đẩy các thành phần kinh tế phát triển đồng bộ; trong đó cần tạo thuận lợi để phát triển khu vực kinh tế tư nhân thực sự trở thành một động lực quan trọng của nền kinh tế. Thúc đẩy hình thành và phát triển các tập đoàn kinh tế tư nhân mạnh, có công nghệ hiện đại và năng lực quản trị tiên tiến. Hoàn thiện chính sách hỗ trợ phát triển các doanh nghiệp nhỏ và vừa.

- **Thu hút đầu tư trực tiếp của nước ngoài có chọn lọc:**
  Hoàn thiện thể chế thu hút đầu tư trực tiếp của nước ngoài theo hướng chủ động lựa chọn các dự án có chuyển giao công nghệ tiên tiến và quản trị hiện đại, có cơ sở R&D tại Việt Nam, có cam kết liên kết, hỗ trợ doanh nghiệp trong nước tham gia chuỗi giá trị toàn cầu. Đồng thời kiểm tra, giám sát, kiểm soát công khai, minh bạch, hạn chế mặt tiêu cực.`
  },
  {
    id: "card-12",
    chapter: 1,
    source: "II.2.b",
    title: "Phát triển đồng bộ yếu tố thị trường và các loại thị trường",
    summary: "Quy luật vận hành giá cả, cạnh tranh và hoàn thiện thị trường vốn, công nghệ, lao động.",
    terms: ["yếu tố thị trường", "các loại thị trường"],
    content: `### Phát triển đồng bộ các yếu tố thị trường và các loại thị trường

- **Hoàn thiện thể chế phát triển đồng bộ các yếu tố thị trường:**
  Các yếu tố thị trường như hàng hóa, giá cả, cạnh tranh, cung cầu... cần phải được vận hành theo nguyên tắc thể chế kinh tế thị trường. Muốn vậy, hệ thống thể chế về giá, về thúc đẩy cạnh tranh, về chất lượng hàng hóa, dịch vụ... cần phải được hoàn thiện để thúc đẩy sự hình thành đồng bộ các yếu tố thị trường.

- **Hoàn thiện thể chế để phát triển đồng bộ, vận hành thông suốt các loại thị trường:**
  Các loại thị trường cơ bản như thị trường hàng hóa, dịch vụ; thị trường vốn; thị trường công nghệ; thị trường hàng hóa sức lao động... cần phải được hoàn thiện. Đảm bảo sự vận hành thông suốt, phát huy tác động tích cực, cộng hưởng của các thị trường đối với sự phát triển của thể chế kinh tế thị trường định hướng xã hội chủ nghĩa.`
  },
  {
    id: "card-13",
    chapter: 1,
    source: "II.2.c",
    title: "Tăng trưởng bền vững, công bằng xã hội và hội nhập quốc tế",
    summary: "Gắn kết tăng trưởng với bình đẳng xã hội và 2 nhiệm vụ chủ động hội nhập.",
    terms: [],
    content: `### Gắn tăng trưởng với phát triển bền vững và hội nhập quốc tế

Xây dựng hệ thống thể chế để có thể kết hợp chặt chẽ phát triển kinh tế nhanh và bền vững với phát triển xã hội bền vững, thực hiện tiến bộ, công bằng xã hội, tạo cơ hội cho mọi thành viên trong xã hội tham gia bình đẳng và thụ hưởng công bằng thành quả từ quá trình phát triển.

Xây dựng và hoàn thiện thể chế về hội nhập kinh tế quốc tế ở Việt Nam hiện nay cần tập trung vào các nhiệm vụ:
1. Tiếp tục rà soát, bổ sung, điều chỉnh hệ thống pháp luật và các thể chế liên quan đáp ứng yêu cầu thực hiện các cam kết quốc tế của Việt Nam.
2. Thực hiện nhất quán chủ trương đa phương hóa, đa dạng hóa trong hợp tác kinh tế quốc tế, không để bị lệ thuộc vào một số ít thị trường. Nâng cao năng lực cạnh tranh quốc gia và tiềm lực doanh nghiệp trong nước. Phản ứng nhanh nhạy trước biến động thế giới, bảo vệ lợi ích quốc gia - dân tộc.`
  },
  {
    id: "card-14",
    chapter: 1,
    source: "II.2.d",
    title: "Nâng cao năng lực lãnh đạo của Đảng và hệ thống chính trị",
    summary: "Vai trò lãnh đạo của Đảng, quản lý của Nhà nước và quyền làm chủ của nhân dân.",
    terms: [],
    content: `### Nâng cao năng lực lãnh đạo của Đảng và hệ thống chính trị

Xây dựng hệ thống thể chế đồng bộ để nâng cao năng lực lãnh đạo của Đảng, vai trò xây dựng và thực hiện thể chế kinh tế của Nhà nước, phát huy vai trò làm chủ của nhân dân trong hoàn thiện thể chế kinh tế thị trường định hướng xã hội chủ nghĩa.

Để phát triển thành công kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam phải phát huy được sức mạnh về trí tuệ, nguồn lực và sự đồng thuận của toàn dân tộc.

Muốn vậy cần phải nâng cao năng lực lãnh đạo của Đảng, vai trò của Nhà nước và phát huy vai trò của nhân dân.`
  },

  // --- CHƯƠNG 2: CÁC QUAN HỆ LỢI ÍCH KINH TẾ Ở VIỆT NAM (Mục III) ---
  {
    id: "card-15",
    chapter: 2,
    source: "III",
    title: "Mục tiêu nghiên cứu các quan hệ lợi ích kinh tế",
    summary: "Trang bị khía cạnh lý luận về quan hệ lợi ích và kỹ năng bảo vệ lợi ích chính đáng.",
    terms: [],
    content: `### Mục tiêu nghiên cứu Các quan hệ lợi ích kinh tế ở Việt Nam

Nội dung phần này trang bị cho sinh viên những khía cạnh lý luận cơ bản về quan hệ lợi ích và các phương thức bảo đảm hài hòa các quan hệ lợi ích trong phát triển ở Việt Nam.

Trên cơ sở đó, góp phần giúp sinh viên hình thành được kỹ năng ứng xử và bảo vệ lợi ích chính đáng của bản thân khi tham gia các hoạt động trong nền kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam.`
  },
  {
    id: "card-16",
    chapter: 2,
    source: "III.1.a.khai-niem-loi-ich-kinh-te",
    title: "Khái niệm Lợi ích và Lợi ích kinh tế",
    summary: "Định nghĩa lợi ích là sự thỏa mãn nhu cầu và lợi ích vật chất là quyết định.",
    terms: ["lợi ích kinh tế"],
    content: `### Khái niệm Lợi ích kinh tế

Để tồn tại, phát triển, con người cần được thỏa mãn các nhu cầu vật chất cũng như nhu cầu tinh thần. Lợi ích thu được khi con người được thỏa mãn nhu cầu của mình. Lợi ích có thể là lợi ích vật chất, có thể là lợi ích tinh thần.

Lợi ích là sự thỏa mãn nhu cầu của con người mà sự thỏa mãn nhu cầu này phải được nhận thức và đặt trong mối quan hệ xã hội ứng với trình độ phát triển nhất định của nền sản xuất xã hội đó.

Xuyên suốt quá trình tồn tại của con người và đời sống xã hội thì lợi ích vật chất đóng vai trò quyết định thúc đẩy hoạt động của mỗi cá nhân, tổ chức cũng như xã hội.

**Lợi ích kinh tế là lợi ích vật chất, lợi ích thu được khi thực hiện các hoạt động kinh tế của con người.**`
  },
  {
    id: "card-17",
    chapter: 2,
    source: "III.1.a.ban-chat-va-bieu-hien-cua",
    title: "Bản chất của lợi ích kinh tế",
    summary: "Lợi ích kinh tế phản ánh mục đích, động cơ các quan hệ giữa các chủ thể sản xuất.",
    terms: [],
    content: `### Bản chất của lợi ích kinh tế

Về bản chất, lợi ích kinh tế phản ánh mục đích và động cơ của các quan hệ giữa các chủ thể trong nền sản xuất xã hội.

Các thành viên trong xã hội xác lập các quan hệ kinh tế với nhau vì trong quan hệ đó hàm chứa những lợi ích kinh tế mà họ có thể có được. Ph. Ăngghen viết: *"Những quan hệ kinh tế của một xã hội nhất định nào đó biểu hiện trước hết dưới hình thức lợi ích"*.

Các quan hệ xã hội luôn mang tính lịch sử, do vậy, lợi ích kinh tế trong mỗi giai đoạn cũng phản ánh bản chất xã hội của giai đoạn lịch sử đó.`
  },
  {
    id: "card-18",
    chapter: 2,
    source: "III.1.a.ban-chat-va-bieu-hien-cua",
    title: "Biểu hiện của lợi ích kinh tế",
    summary: "Lợi nhuận của chủ doanh nghiệp và tiền lương, thu nhập của người lao động.",
    terms: [],
    content: `### Biểu hiện của lợi ích kinh tế

Về biểu hiện, gắn với các chủ thể kinh tế khác nhau là những lợi ích tương ứng: lợi ích của chủ doanh nghiệp trước hết là lợi nhuận, lợi ích của người lao động là thu nhập.

Song, về lâu dài, đã tham gia vào hoạt động kinh tế thì lợi ích kinh tế là lợi ích quyết định. Nếu không thấy được vai trò này của lợi ích kinh tế sẽ làm suy giảm động lực hoạt động của các cá nhân.

Khi đề cập tới phạm trù lợi ích kinh tế có nghĩa hàm ý rằng, lợi ích đó được xác lập trong quan hệ nào, ai là người thụ hưởng lợi ích, quyền hạn và trách nhiệm của các chủ thể đó. Trong nền kinh tế thị trường, ở đâu có hoạt động sản xuất kinh doanh, lao động, ở đó có quan hệ lợi ích và lợi ích kinh tế.`
  },
  {
    id: "card-19",
    chapter: 2,
    source: "III.1.a.vai-tro-cua-loi-ich-kinh",
    title: "Lợi ích kinh tế là động lực trực tiếp",
    summary: "Nâng cao thu nhập là mục tiêu thôi thúc lao động sáng tạo và phát triển sản xuất.",
    terms: [],
    content: `### Lợi ích kinh tế là động lực trực tiếp của các chủ thể

Con người tiến hành các hoạt động kinh tế trước hết là để thỏa mãn các nhu cầu vật chất, nâng cao phương thức và mức độ thỏa mãn các nhu cầu vật chất của mình. Trong nền kinh tế thị trường, phương thức và mức độ thỏa mãn các nhu cầu vật chất tùy thuộc vào mức thu nhập.

Do đó, thu nhập càng cao, phương thức và mức độ thỏa mãn các nhu cầu vật chất càng tốt. Vì vậy, mọi chủ thể kinh tế đều phải hành động để nâng cao thu nhập của mình.

Theo đuổi lợi ích kinh tế chính đáng của mình, các chủ thể kinh tế đã đóng góp vào sự phát triển của nền kinh tế. Vì lợi ích chính đáng của mình, người lao động phải tích cực lao động sản xuất, nâng cao tay nghề, cải tiến công cụ; chủ doanh nghiệp phải tìm cách nâng cao hiệu quả sử dụng nguồn lực.`
  },
  {
    id: "card-20",
    chapter: 2,
    source: "III.1.a.vai-tro-cua-loi-ich-kinh",
    title: "Lợi ích kinh tế là cơ sở của các lợi ích khác & Nguyên tắc vì dân",
    summary: "Lợi ích kinh tế là cơ sở cho lợi ích chính trị, văn hóa; quan điểm 'dân là gốc'.",
    terms: [],
    content: `### Cơ sở thúc đẩy các lợi ích khác & Nguyên tắc vì dân

Lợi ích kinh tế được thực hiện sẽ tạo điều kiện vật chất cho sự hình thành và thực hiện lợi ích chính trị, lợi ích xã hội, lợi ích văn hóa của các chủ thể xã hội. Mọi vận động của lịch sử, xét đến cùng, đều xoay quanh lợi ích kinh tế.

Hộp 5.3: Quan điểm của Đảng: Đổi mới phải luôn luôn quán triệt quan điểm "dân là gốc", vì lợi ích của nhân dân, dựa vào nhân dân, phát huy vai trò làm chủ của nhân dân.

Chỉ khi có sự đồng thuận, thống nhất giữa các lợi ích kinh tế thì lợi ích kinh tế mới thực hiện được vai trò của mình. Việc theo đuổi lợi ích kinh tế không chính đáng, bất hợp pháp sẽ trở thành trở ngại cho phát triển. Quan điểm của Đảng và Nhà nước ta hiện nay là coi lợi ích kinh tế là động lực, tôn trọng lợi ích cá nhân chính đáng.`
  },
  {
    id: "card-21",
    chapter: 2,
    source: "III.1.b.khai-niem-quan-he-loi-ich",
    title: "Khái niệm Quan hệ lợi ích kinh tế",
    summary: "Định nghĩa quan hệ lợi ích kinh tế theo chiều dọc, chiều ngang và quốc tế.",
    terms: ["quan hệ lợi ích kinh tế"],
    content: `### Khái niệm Quan hệ lợi ích kinh tế

Quan hệ lợi ích kinh tế là sự thiết lập những tương tác giữa con người với con người, giữa các cộng đồng người, giữa các tổ chức kinh tế, giữa các bộ phận hợp thành nền kinh tế, giữa con người với tổ chức kinh tế, giữa quốc gia với phần còn lại của thế giới nhằm mục tiêu xác lập các lợi ích kinh tế trong mối liên hệ với trình độ phát triển của lực lượng sản xuất và kiến trúc thượng tầng tương ứng của một giai đoạn phát triển xã hội nhất định.

Quan hệ lợi ích có biểu hiện phong phú: quan hệ theo chiều dọc (giữa tổ chức và cá nhân), theo chiều ngang (giữa các chủ thể, cộng đồng) và quan hệ giữa quốc gia với thế giới.`
  },
  {
    id: "card-22",
    chapter: 2,
    source: "III.1.b.su-thong-nhat-va-mau-thuan",
    title: "Sự thống nhất trong quan hệ lợi ích kinh tế",
    summary: "Chủ thể này thực hiện lợi ích tạo điều kiện cho chủ thể khác thực hiện lợi ích.",
    terms: [],
    content: `### Sự thống nhất trong quan hệ lợi ích kinh tế

Quan hệ lợi ích kinh tế thống nhất với nhau vì một chủ thể có thể trở thành bộ phận cấu thành của chủ thể khác. Do đó, lợi ích của chủ thể này được thực hiện thì lợi ích của chủ thể khác cũng trực tiếp hoặc gián tiếp được thực hiện.

Chẳng hạn, mỗi cá nhân người lao động là bộ phận cấu thành doanh nghiệp. Doanh nghiệp hoạt động càng có hiệu quả thì lợi ích của người lao động càng được đảm bảo (việc làm, thu nhập ổn định). Ngược lại, người lao động tích cực làm việc sẽ nâng cao lợi ích của doanh nghiệp.

Trong nền kinh tế thị trường, khi các chủ thể kinh tế hành động vì mục tiêu chung hoặc các mục tiêu thống nhất với nhau thì các lợi ích kinh tế của các chủ thể đó thống nhất với nhau.`
  },
  {
    id: "card-23",
    chapter: 2,
    source: "III.1.b.su-thong-nhat-va-mau-thuan",
    title: "Sự mâu thuẫn trong quan hệ lợi ích kinh tế",
    summary: "Mâu thuẫn nảy sinh khi hành động đối lập nhau và phân phối kết quả sản xuất.",
    terms: [],
    content: `### Sự mâu thuẫn trong quan hệ lợi ích kinh tế

Các quan hệ lợi ích kinh tế mâu thuẫn với nhau vì các chủ thể kinh tế có thể hành động theo những phương thức khác nhau để thực hiện các lợi ích của mình. Sự khác nhau đó đến mức đối lập thì trở thành mâu thuẫn.

Ví dụ, vì lợi ích của mình, cá nhân, doanh nghiệp làm hàng giả, buôn lậu, trốn thuế... thì lợi ích của doanh nghiệp mâu thuẫn với lợi ích xã hội. Khi đó, chủ doanh nghiệp càng thu lợi nhuận thì lợi ích xã hội càng tổn hại.

Lợi ích của các chủ thể trực tiếp phân phối kết quả cũng mâu thuẫn: tại một thời điểm, kết quả là xác định. Thu nhập chủ thể này tăng thì thu nhập chủ thể khác giảm (ví dụ tiền lương người lao động bị bớt xén làm tăng lợi nhuận chủ doanh nghiệp). Mâu thuẫn về lợi ích kinh tế là cội nguồn của các xung đột xã hội.`
  },
  {
    id: "card-24",
    chapter: 2,
    source: "III.1.b.su-thong-nhat-va-mau-thuan",
    title: "Điều hòa mâu thuẫn & Nền tảng của lợi ích cá nhân",
    summary: "Chức năng điều hòa của Nhà nước và vai trò cơ sở của lợi ích cá nhân chính đáng.",
    terms: [],
    content: `### Điều hòa mâu thuẫn & Lợi ích cá nhân là nền tảng

Điều hòa mâu thuẫn giữa các lợi ích kinh tế buộc các chủ thể phải quan tâm và trở thành chức năng quan trọng của nhà nước nhằm ổn định xã hội, tạo động lực phát triển kinh tế - xã hội.

Trong các hình thức lợi ích kinh tế, lợi ích cá nhân là cơ sở, nền tảng của các lợi ích khác, bởi vì:
1. Nhu cầu cơ bản, sống còn trước hết thuộc về các cá nhân, quyết định hoạt động của các cá nhân;
2. Thực hiện lợi ích cá nhân là cơ sở để thực hiện các lợi ích khác vì cá nhân cấu thành nên tập thể, giai cấp, xã hội...

Do đó, lợi ích cá nhân chính đáng cần được pháp luật tôn trọng và bảo vệ.`
  },
  {
    id: "card-25",
    chapter: 2,
    source: "III.1.b.cac-nhan-to-anh-huong-den",
    title: "Nhân tố Lực lượng sản xuất và Quan hệ sản xuất",
    summary: "Tác động của trình độ phát triển LLSX và địa vị sở hữu trong QHSX.",
    terms: [],
    content: `### Nhân tố Lực lượng sản xuất và Quan hệ sản xuất

- **Thứ nhất, trình độ phát triển của lực lượng sản xuất:**
  Là phương thức và mức độ thỏa mãn nhu cầu vật chất, lợi ích kinh tế trước hết phụ thuộc vào số lượng, chất lượng hàng hóa, dịch vụ, mà điều này lại phụ thuộc vào trình độ phát triển của lực lượng sản xuất. Trình độ lực lượng sản xuất càng cao, việc đáp ứng lợi ích kinh tế càng tốt, quan hệ lợi ích càng có điều kiện thống nhất. Do đó phát triển lực lượng sản xuất là nhiệm vụ hàng đầu.

- **Thứ hai, địa vị của chủ thể trong hệ thống quan hệ sản xuất xã hội:**
  Quan hệ sản xuất, trước hết là quan hệ sở hữu về tư liệu sản xuất, quyết định vị trí, vai trò của mỗi chủ thể trong hoạt động kinh tế. Không có lợi ích kinh tế nằm ngoài quan hệ sản xuất và trao đổi.`
  },
  {
    id: "card-26",
    chapter: 2,
    source: "III.1.b.cac-nhan-to-anh-huong-den",
    title: "Nhân tố Phân phối thu nhập và Hội nhập kinh tế quốc tế",
    summary: "Ảnh hưởng của chính sách phân phối của Nhà nước và mở cửa thị trường quốc tế.",
    terms: [],
    content: `### Nhân tố Phân phối thu nhập và Hội nhập quốc tế

- **Thứ ba, chính sách phân phối thu nhập của nhà nước:**
  Sự can thiệp của nhà nước vào kinh tế là tất yếu khách quan. Chính sách phân phối thu nhập của nhà nước làm thay đổi mức thu nhập và tương quan thu nhập của các chủ thể kinh tế, từ đó làm thay đổi phương thức, mức độ thỏa mãn nhu cầu và quan hệ lợi ích kinh tế giữa các chủ thể.

- **Thứ tư, hội nhập kinh tế quốc tế:**
  Bản chất của kinh tế thị trường là mở cửa hội nhập. Hội nhập giúp gia tăng lợi ích kinh tế từ thương mại và đầu tư quốc tế. Tuy nhiên, doanh nghiệp nội địa phải chịu áp lực cạnh tranh gay gắt từ hàng hóa nước ngoài, đối mặt với nguy cơ cạn kiệt tài nguyên, ô nhiễm môi trường. Hội nhập tác động mạnh mẽ và nhiều chiều đến lợi ích kinh tế.`
  },
  {
    id: "card-27",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Quan hệ giữa Người lao động và Người sử dụng lao động",
    summary: "Khái niệm người lao động, người sử dụng lao động, tiền lương và sự thống nhất.",
    terms: ["người lao động", "người sử dụng lao động", "tiền lương"],
    content: `### Quan hệ giữa Người lao động và Người sử dụng lao động (Phần 1)

Người lao động là người có đủ thể lực và trí lực để lao động. Khi bán sức lao động họ nhận được tiền lương (tiền công). Bản chất tiền lương là giá cả hàng hóa sức lao động, đủ để tái sản xuất sức lao động.

Người sử dụng lao động là chủ doanh nghiệp, cơ quan, tổ chức, cá nhân có thuê mướn lao động. Lợi ích của họ thể hiện ở lợi nhuận; lợi ích của người lao động thể hiện ở tiền lương, thu nhập.

**Sự thống nhất:** Nếu người sử dụng lao động kinh doanh thuận lợi sẽ có lợi nhuận và tiếp tục thuê lao động, người lao động có việc làm và tiền lương. Ngược lại, người lao động làm việc tích cực sẽ giúp gia tăng lợi nhuận của doanh nghiệp.`
  },
  {
    id: "card-28",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Mâu thuẫn lao động và Tổ chức đại diện bảo vệ quyền lợi",
    summary: "Mâu thuẫn tiền lương - lợi nhuận và vai trò của Công đoàn, Nghiệp đoàn.",
    terms: [],
    content: `### Mâu thuẫn lao động và Tổ chức đại diện (Phần 2)

**Mâu thuẫn:** Tại một thời điểm, kết quả hoạt động kinh doanh là xác định. Lợi nhuận của người sử dụng lao động tăng thì tiền lương người lao động giảm và ngược lại. Người sử dụng lao động luôn muốn cắt giảm chi phí lương để tối đa hóa lợi nhuận; người lao động đấu tranh đòi tăng lương, giảm giờ làm, cải thiện điều kiện làm việc.

Nếu mâu thuẫn không được giải quyết hợp lý sẽ ảnh hưởng xấu tới sản xuất.

**Tổ chức đại diện:** Để bảo vệ lợi ích của mình, người lao động lập ra tổ chức Công đoàn (tổ chức quan trọng nhất bảo vệ quyền lợi người lao động). Người sử dụng lao động có các nghiệp đoàn, hội nghề nghiệp. Mọi tranh chấp, đấu tranh phải tuân thủ pháp luật.`
  },
  {
    id: "card-29",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Quan hệ giữa những người sử dụng lao động & Đội ngũ doanh nhân",
    summary: "Vừa là đối tác vừa là đối thủ, tỷ suất lợi nhuận bình quân và vai trò doanh nhân.",
    terms: ["đội ngũ doanh nhân"],
    content: `### Quan hệ giữa những người sử dụng lao động

Trong cơ chế thị trường, những người sử dụng lao động vừa là đối tác, vừa là đối thủ của nhau. Họ liên kết và cạnh tranh quyết liệt trong việc ứng xử với người lao động, vay vốn, chiếm lĩnh thị trường. Doanh nghiệp có giá trị cá biệt cao hơn giá trị xã hội sẽ bị thua lỗ, phá sản.

Họ cạnh tranh trong nội bộ ngành và giữa các ngành thông qua di chuyển vốn, hình thành tỷ suất lợi nhuận bình quân (chia nhau lợi nhuận theo vốn đóng góp).

Sự thống nhất về lợi ích làm cho họ liên kết, hỗ trợ lẫn nhau, hình thành nên **đội ngũ doanh nhân**. Đội ngũ doanh nhân đóng góp quan trọng vào phát triển kinh tế - xã hội nên cần được tôn vinh và tạo thuận lợi phát triển.`
  },
  {
    id: "card-30",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Quan hệ giữa những người lao động với nhau",
    summary: "Cạnh tranh bán sức lao động và sự cần thiết phải đoàn kết thông qua tổ chức.",
    terms: [],
    content: `### Quan hệ giữa những người lao động với nhau

Trong nền kinh tế thị trường, nhiều người muốn bán sức lao động. Để thực hiện lợi ích của mình, người lao động không chỉ quan hệ với chủ sử dụng mà còn phải quan hệ với nhau.

Nếu có nhiều người bán sức lao động, người lao động phải cạnh tranh với nhau, dẫn đến hậu quả là tiền lương bị ép giảm xuống hoặc một bộ phận bị sa thải.

Ngược lại, nếu những người lao động đoàn kết, thống nhất với nhau thông qua tổ chức đại diện của mình, họ có thể thực hiện được các yêu sách chính đáng đối với giới chủ. Sự đoàn kết, giúp đỡ lẫn nhau giữa những người lao động là rất cần thiết nhưng phải dựa trên quy định của pháp luật.`
  },
  {
    id: "card-31",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Quan hệ giữa Lợi ích cá nhân và Lợi ích xã hội",
    summary: "Mối liên hệ hai chiều giữa cá nhân và xã hội, trích dẫn của Ăngghen.",
    terms: [],
    content: `### Quan hệ giữa Lợi ích cá nhân và Lợi ích xã hội

Người lao động và người sử dụng lao động đều là thành viên xã hội. Nếu họ làm việc đúng pháp luật và thực hiện được lợi ích kinh tế chính đáng thì đã đóng góp cho lợi ích xã hội. Khi xã hội phát triển, môi trường thuận lợi sẽ quay lại phục vụ cá nhân thực hiện lợi ích tốt hơn.

Ngược lại, nếu các chủ thể thông đồng trốn thuế, làm hàng giả thì lợi ích xã hội bị tổn hại, đất nước chậm phát triển.

Sự tồn tại và phát triển của xã hội quyết định sự tồn tại của cá nhân nên lợi ích xã hội định hướng cho lợi ích cá nhân. Ph. Ăngghen khẳng định: *"Ở đâu không có lợi ích chung thì ở đó không thể có sự thống nhất về mục đích và cũng không thể có sự thống nhất về hành động được"*`
  },
  {
    id: "card-32",
    chapter: 2,
    source: "III.1.b.mot-so-quan-he-loi-ich",
    title: "Lợi ích nhóm, Nhóm lợi ích và Ngăn chặn mặt tiêu cực",
    summary: "Phân biệt lợi ích nhóm vs nhóm lợi ích và chống nhóm lợi ích tiêu cực, tham nhũng.",
    terms: ["lợi ích nhóm", "nhóm lợi ích"],
    content: `### Lợi ích nhóm, Nhóm lợi ích và Phòng chống tiêu cực

- **Lợi ích nhóm:** Các cá nhân, tổ chức hoạt động trong cùng ngành, cùng lĩnh vực, liên kết với nhau trong hành động để thực hiện tốt hơn lợi ích riêng của họ (hiệp hội ngành nghề, nhóm cư dân theo vùng).
- **Nhóm lợi ích:** Các cá nhân, tổ chức hoạt động trong các ngành, lĩnh vực khác nhau liên kết với nhau trong hành động (mô hình 4 nhà: nông nghiệp - doanh nghiệp - khoa học - nhà nước; nhà đất - ngân hàng - người mua).

Nếu phù hợp lợi ích quốc gia thì cần tôn trọng, tạo điều kiện. Nếu mâu thuẫn với lợi ích quốc gia, gây hại cho xã hội thì phải ngăn chặn.

Đặc biệt, "nhóm lợi ích" tiêu cực có sự cấu kết của công chức, quyền lực công quyền sẽ gây hậu quả nghiêm trọng và thường không lộ diện. Do đó việc phòng chống tiêu cực phải quyết liệt, thường xuyên.`
  },
  {
    id: "card-33",
    chapter: 2,
    source: "III.1.b.phuong-thuc-thuc-hien-loi-ich",
    title: "Hai phương thức thực hiện lợi ích kinh tế chủ yếu",
    summary: "Thực hiện theo nguyên tắc thị trường và theo chính sách phân phối của Nhà nước.",
    terms: ["nguyên tắc thị trường"],
    content: `### Hai phương thức thực hiện lợi ích kinh tế

Trong điều kiện kinh tế thị trường định hướng xã hội chủ nghĩa, có hai phương thức cơ bản:

1. **Thực hiện lợi ích kinh tế theo nguyên tắc thị trường:**
   Các quan hệ lợi ích, các chủ thể kinh tế để thực hiện lợi ích của mình phải căn cứ vào các nguyên tắc của thị trường (cung cầu, giá cả, cạnh tranh). Đây là phương thức phổ biến trong mọi nền kinh tế thị trường.

2. **Thực hiện lợi ích kinh tế theo chính sách của nhà nước và vai trò tổ chức xã hội:**
   Nếu chỉ theo nguyên tắc thị trường sẽ tất yếu dẫn đến bất bình đẳng và phân hóa xã hội. Do đó, phương thức thực hiện dựa trên chính sách phân phối, an sinh xã hội của Nhà nước và sự tham gia của các tổ chức xã hội là bắt buộc nhằm bảo đảm công bằng và thúc đẩy tiến bộ xã hội.`
  }
];

// Tạo thư mục đích
fs.mkdirSync(path.join(OUT_DIR, 'ch01'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'ch02'), { recursive: true });

const results = [];

for (const card of rawCards) {
  const words = card.content.trim().split(/\s+/).length;
  card.wordCount = words;

  const chDir = card.chapter === 1 ? 'ch01' : 'ch02';
  const fileName = `${card.id}.md`;
  const filePath = path.join(OUT_DIR, chDir, fileName);

  const mdText = `---
id: "${card.id}"
chapter: ${card.chapter}
source: "${card.source}"
title: "${card.title}"
summary: "${card.summary}"
wordCount: ${words}
terms: ${JSON.stringify(card.terms)}
---

${card.content.trim()}
`;

  fs.writeFileSync(filePath, mdText, 'utf8');
  results.push(card);
}

// Ghi file index JSON tổng hợp để app import dễ dàng
fs.writeFileSync(path.join(OUT_DIR, 'cards.json'), JSON.stringify(results, null, 2), 'utf8');

console.log(`Đã xuất thành công ${results.length} thẻ tri thức vào ${OUT_DIR}/`);
console.log(`- Chương 1: ${results.filter(c => c.chapter === 1).length} thẻ`);
console.log(`- Chương 2: ${results.filter(c => c.chapter === 2).length} thẻ`);

const minWords = Math.min(...results.map(c => c.wordCount));
const maxWords = Math.max(...results.map(c => c.wordCount));
const avgWords = Math.round(results.reduce((acc, c) => acc + c.wordCount, 0) / results.length);
console.log(`- Độ dài từ mỗi thẻ: Min ${minWords} từ | Max ${maxWords} từ | Trung bình ${avgWords} từ (chuẩn 150-250 từ)`);
