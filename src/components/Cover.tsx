import type { ReactNode } from 'react'
import { dateLabel, event, hostName, photoUrl, studentId } from '../lib/invite'
import { Split } from './ui'

/** Bìa tạp chí GRADUATE. dùng chung; phần chữ phía dưới (children) đổi theo trang khách / trang chính */
export function Cover({ children }: { children: ReactNode }) {
  return (
    <div className="cover">
      <div className="m-photo">
        <img src={photoUrl} alt="Ảnh bìa tân khoa" />
        <div className="m-shade" />
      </div>
      <div className="m-issue z1">
        <span>Số đặc biệt</span>
        <span>
          Tháng {dateLabel.slice(3, 5)} · {event.classOf}
        </span>
        <span>Giá: Vô giá</span>
      </div>
      <h2 className="mast z2">
        <Split text="GRADUATE" />
        <span className="text-gold">.</span>
      </h2>
      <div className="cl-l z3">
        <span className="m-tag">ĐỘC QUYỀN</span>
        <p className="m-big">
          4 năm
          <br />
          thanh xuân
        </p>
        <p className="m-small">Hành trình từ tân sinh viên đến tân khoa</p>
        <p className="m-big m-big2">
          Sống sót qua
          <br />
          đồ án &amp; deadline
        </p>
        <p className="m-small">Bí kíp debug lúc 3 giờ sáng</p>
      </div>
      <div className="cl-r z3">
        <p className="m-script">Class of</p>
        <svg className="m-year" viewBox="0 0 300 120">
          <text className="year" x="300" y="100" textAnchor="end">
            {event.classOf}
          </text>
        </svg>
        {hostName && <p className="m-host">{hostName}</p>}
        {studentId && <p className="m-small">MSSV {studentId}</p>}
        <p className="m-small">
          {event.venue.name}
          <br />
          {event.venue.short}
        </p>
      </div>
      <div className="sticker z4">
        <i>CHÍNH THỨC</i>
        <b>RA</b>
        <i>TRƯỜNG!</i>
      </div>
      <div className="m-bottom z3">{children}</div>
      <div className="cover-back" />
    </div>
  )
}
