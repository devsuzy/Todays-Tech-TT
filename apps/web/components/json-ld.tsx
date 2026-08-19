// 구조화 데이터(JSON-LD) 삽입용 — Google 리치 결과 인식을 위해 서버에서 렌더한다
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 값은 서버에서 만든 객체를 직렬화한 것이라 사용자 입력이 그대로 들어가지 않는다
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
