"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type TermsArticle = {
  title: string;
  paragraphs: string[];
};

const TERMS_ARTICLES: TermsArticle[] = [
  {
    title: "제1조 (목적)",
    paragraphs: [
      "본 약관은 YATA(이하 '회사')가 제공하는 카풀 커뮤니티 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.",
    ],
  },
  {
    title: "제2조 (정의)",
    paragraphs: [
      "1. '서비스'란 회사가 제공하는 카풀 매칭 및 정산, 채팅 등 일체의 서비스를 의미합니다.",
      "2. '회원'이란 본 약관에 동의하고 회사와 이용계약을 체결하여 서비스를 이용하는 자를 말합니다.",
      "3. '방(Room)'이란 동일 목적지를 향하는 회원들이 모여 카풀을 진행하는 단위를 의미합니다.",
      "4. '호스트'란 방을 생성하고 운영하며 정산을 주관하는 회원을 말합니다.",
    ],
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    paragraphs: [
      "1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.",
      "2. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 사전에 공지합니다.",
    ],
  },
  {
    title: "제4조 (회원가입 및 자격)",
    paragraphs: [
      "1. 서비스는 학교 이메일 인증을 완료한 재학생 회원을 대상으로 합니다. 휴학생, 졸업생, 교직원 등은 서비스 이용 대상에서 제외됩니다.",
      "2. 회사는 안전한 카풀 환경을 위해 본인 확인 및 인증 절차를 요구할 수 있습니다.",
      "3. 타인의 정보를 도용하거나 허위로 가입한 경우 이용이 제한될 수 있습니다.",
    ],
  },
  {
    title: "제5조 (개인정보의 보호)",
    paragraphs: [
      "1. 회사는 회원의 개인정보를 관련 법령에 따라 안전하게 관리하며, 서비스 제공 목적 범위 내에서만 이용합니다.",
      "2. 정산을 위해 입력한 계좌번호 등 금융 정보는 AES-256 등 강력한 암호화 알고리즘을 적용하여 보관하며, 정산 목적 외에는 일체 이용하지 않습니다.",
      "3. 회원 탈퇴 시 관련 법령에서 정한 보관 의무가 있는 경우를 제외하고 회원의 개인정보는 지체 없이 파기됩니다.",
    ],
  },
  {
    title: "제6조 (회원의 의무)",
    paragraphs: [
      "1. 회원은 카풀 진행 시 약속한 시간과 장소를 준수하고, 다른 회원에게 예의를 갖추어야 합니다.",
      "2. 회원은 정산 금액을 성실히 송금하고, 정산 정보를 사실대로 입력해야 합니다.",
      "3. 회원은 타인에게 불쾌감을 주거나 안전을 위협하는 행위를 하여서는 안 됩니다.",
    ],
  },
  {
    title: "제7조 (서비스의 제공 및 변경)",
    paragraphs: [
      "1. 회사는 연중무휴, 1일 24시간 서비스 제공을 원칙으로 합니다.",
      "2. 다만 시스템 점검, 설비 보수 등 운영상 필요한 경우 서비스의 전부 또는 일부를 일시 중단할 수 있으며, 이 경우 사전에 공지합니다.",
    ],
  },
  {
    title: "제8조 (책임의 한계)",
    paragraphs: [
      "1. 회사는 회원 간 카풀 매칭 및 정산을 중개하는 플랫폼을 제공할 뿐, 회원 간 직접 이루어지는 카풀 운행 그 자체의 당사자가 아닙니다.",
      "2. 회원 간의 분쟁 또는 카풀 운행 중 발생한 사고에 대해 회사는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다. 단, 회사가 안전한 서비스 제공을 위해 합리적으로 취할 수 있는 조치를 게을리한 경우에는 관련 법령이 정하는 바에 따라 책임을 집니다.",
      "3. 회사는 천재지변, 불가항력 등으로 인한 서비스 제공 장애에 대해 책임을 지지 않습니다.",
      "4. 본 조의 책임 제한은 소비자기본법 등 관련 법령에서 정한 소비자 권리를 침해하지 않는 범위 내에서 적용됩니다.",
    ],
  },
  {
    title: "제9조 (회원 탈퇴 및 이용 제한)",
    paragraphs: [
      "1. 회원은 언제든지 설정 메뉴를 통해 탈퇴를 요청할 수 있으며, 회사는 관련 절차에 따라 이를 처리합니다.",
      "2. 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 회사는 사전 통지 후 이용을 제한하거나 계약을 해지할 수 있습니다.",
    ],
  },
  {
    title: "제10조 (준거법 및 관할)",
    paragraphs: [
      "본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이 발생할 경우 관할 법원은 민사소송법에 따라 정합니다.",
    ],
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-page">
      <header className="sticky top-0 z-10 flex h-14 w-full items-center border-b border-stroke-thin bg-bg-normal px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-6 text-fg-primary" />
        </button>
        <h1 className="text-strong-1 font-bold text-fg-primary">이용 약관</h1>
      </header>

      <div className="flex w-full flex-1 flex-col gap-6 px-5 pb-16 pt-4">
        <p className="text-caption-1 font-medium text-fg-tertiary">
          본 약관은 서비스 이해를 돕기 위한 예시 문안입니다. 실제 서비스 적용 시
          법무 검토를 거친 약관으로 대체됩니다.
        </p>

        {TERMS_ARTICLES.map((article) => (
          <section key={article.title} className="flex flex-col gap-2.5">
            <h2 className="text-body-1 font-bold text-fg-primary">
              {article.title}
            </h2>
            <div className="flex flex-col gap-2">
              {article.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-caption-1 font-medium leading-relaxed text-fg-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <p className="pt-2 text-caption-2 font-medium text-fg-tertiary">
          시행일자: 2026년 1월 1일
        </p>
      </div>
    </div>
  );
}
