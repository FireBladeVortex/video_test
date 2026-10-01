
const 이름_목록 =
[
	{  이름 : "아쿠루" },
	{  이름 : "감규리" },
	{  이름 : "이오몽" },
	{  이름 : "마레 플로스" },
	{  이름 : "미녕이데러오께" },
	{  이름 : "마젯" },
	{  이름 : "레드" },
	{  이름 : "위도" },
	{  이름 : "판구리" },
	{  이름 : "앵보" },
	{  이름 : "불법스님" },
	{  이름 : "판구리" },
	{  이름 : "판구리" },
	{  이름 : "향아치" },
]

const 임시_목록 = {}













































































// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
document.head.appendChild(api)

// iframe 들어갈 변수 준비
let player = null
let 재생_대기 = null

// iframe 호출한다면
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width: "100%",
		height: "100%",
		videoId: "",
		playerVars:
		{
			// 자동재생 방지
			autoplay: 0,
			// 영상 종료 때 추천 방지
			rel: 0,
			// 풀 스크린 버튼 숨김
			// fs: 0,
			// 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			disablekb: 1,
			// 유튜브 일부 ui 숨김
			// controls: 0,
			// 뭐임?
			origin: window.location.origin,
			// 자막 한글 pip 모드 제작 대비
			cc_lang_pref: "ko",
			// 자막 자동 실행 pip 모드 제작 대비
			cc_load_policy: 1,
		},

		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				// 현재 value 적용
				player.setVolume(+볼륨_조절.value)
			},
			onError : () =>
			{
				if (재생목록_대기)
				{
					재생목록_대기()
					재생목록_대기 = null
				}
			},
			onStateChange : onPlayerStateChange,
		}
	})
}

























// 1. render_switch()
// 가나다+ 이름목록 생성

// 2. 이름 클릭해서 재생목록_불러오기(누구) 실행

// 3. 재생목록_불러오기(누구)에서 이름을 파일명으로 변경하고
// id 가공하고 색깔 적용하고
// switch_click()으로 make_list() 실행 + 썸네일 들어갈 크기 계산

// 4. cue_intro() 으로 소개영상(가공된 소개영상 id) 불러오기

// 5. 이름 목록들 제거


// //
// make_list() 내부 순서
