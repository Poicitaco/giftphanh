import Link from "next/link";

const colors = ["mint", "sky", "lavender", "yellow", "peach", "pink", "coral", "sage"];
const stars = Array.from({ length: 56 }, (_, index) => ({
  color: colors[index % colors.length],
  left: (index * 37) % 101,
  size: 20 + ((index * 17) % 44),
  bottom: -8 + ((index * 19) % 38),
  delay: (index % 14) * 0.11,
  rotation: -24 + ((index * 29) % 49),
}));

export function WelcomeScene({ authenticated }: { authenticated: boolean }) {
  return (
    <main className="gift-landing scene">
      <nav className="landing-account" aria-label="Tài khoản">
        {authenticated ? (
          <Link className="landing-account-primary" href="/admin">lọ của tôi</Link>
        ) : (
          <>
            <Link href="/login">đăng nhập</Link>
            <Link className="landing-account-primary" href="/sign-up">đăng ký</Link>
          </>
        )}
      </nav>

      <div className="landing-star-pile" aria-hidden="true">
        {stars.map((star, index) => (
          <img
            alt=""
            className="landing-star"
            key={`${star.color}-${index}`}
            src={`/assets/star-${star.color}.png`}
            style={{
              "--star-left": `${star.left}%`,
              "--star-size": `${star.size}px`,
              "--star-bottom": `${star.bottom}px`,
              "--star-delay": `${star.delay}s`,
              "--star-rotation": `${star.rotation}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="landing-content">
        <p className="landing-kicker">một món quà từ rất nhiều người thương</p>
        <h1><span>a little jar</span><strong>of stars</strong></h1>
        <p className="landing-copy">Mỗi người gấp một lá thư thành ngôi sao.<br />Đến ngày đặc biệt, cả chiếc lọ sẽ mở ra cho một người.</p>
        <div className="landing-actions">
          <Link className="paper-button landing-primary" href="/create">★ tạo lọ quà tặng</Link>
          <a className="landing-secondary" href="#recipient-help">tôi nhận được một liên kết</a>
        </div>
      </section>

      <section className="landing-help" id="recipient-help" role="dialog" aria-labelledby="recipient-help-title">
        <article>
          <a className="landing-help-close" href="#" aria-label="Đóng">×</a>
          <h2 id="recipient-help-title">Bạn là người nhận?</h2>
          <p>Hãy mở đúng liên kết người tặng đã gửi riêng cho bạn, rồi nhập mật mã họ cung cấp. Chỉ có mật mã thôi thì chưa đủ — hãy xin thêm liên kết chiếc lọ.</p>
          <a className="paper-button" href="#">mình hiểu rồi</a>
        </article>
      </section>
    </main>
  );
}
