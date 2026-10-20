
const 이름_목록 =
[
	{  이름 : "아쿠루" },
	{  이름 : "감규리" },
	{  이름 : "이오몽" },
	{  이름 : "마레 플로스" },
	{  이름 : "미녕이데려오깨" },
	{  이름 : "마젯" },
	{  이름 : "레드" },
	{  이름 : "위도" },
	{  이름 : "판구리" },
	{  이름 : "앵보" },
	{  이름 : "불법스님" },
	{  이름 : "판구리" },
	{  이름 : "판구리" },
	{  이름 : "향아치" },
	{  이름 : "테스트원곡만" },
	{  이름 : "테스트커버만" },
	{  이름 : "테스트동영상만" },
	{  이름 : "테스트쇼츠만" },
	{  이름 : "테스트부분만" },
	{  이름 : "테스트동영상쇼츠" },
	{  이름 : "테스트동영상부분" },
	{  이름 : "테스트쇼츠부분" },
	{  이름 : "니르" },
	{  이름 : "김길현" },
	{  이름 : "초깨비" },
	{  이름 : "세노" },
]

const 임시_목록 = {}


// 가나다 밑에 작게 들어갈 안내 공간 필요
// * 중복 ** 최신화 필요 *** 등 이런식으로


// 나와 다른 구역이 없는 경우 크기조절버튼 생성 취소

// 부분 밑에 안내 공간 추가
// 적어도 1개의 나와 다른 구역을 가지고 있는 경우
// select를 사용해서 기본형 드롭 다운을 생성하고 (제목으로만)
// 크게 보면 다른 드롭 다운으로 구현 해놨다고 안내해서 큰 화면으로 변환해서 사용할것을 추천
//








/*

==메인 화면
==	섹션 왼쪽
==		헤드 머리말
==			메뉴 가나다 들어갈 자리
==				버튼 가나다
==			메뉴 소속 들어갈 자리
==				버튼 소속
==		섹션 본문
==			메뉴 이름표들
==				버튼 이름표


==	섹션 왼쪽
		섹션 구역

		크기 변화 감지할 섹터 하나 더 필요 div로
			헤드 머리말 동영상/쇼츠/부분
				메뉴 메뉴가 들어갈자리
					버?튼? 동영상/쇼츠/부분 재생목록
					버튼 모두/원곡/커버
					버튼 페이지 이전/지금/다음
					버튼 크기/작게
			섹션 본문
				섹션 동영상/쇼츠/부분



				*/


















































/*

`js/명령.js` 파일만 수정합니다. 파일을 하나씩 순서대로 읽어야 하는 이유는 모든 명단 파일이 같은 전역 변수 `window.재생목록`에 값을 쓰기 때문입니다. 동시에 읽으면 값이 서로 섞입니다.

## 1. 명단 파일을 읽고 재생목록 여부를 검사하는 함수 추가

**파일**: `js/명령.js`
**위치**: `function 채우기_이름표들(왼쪽_이름)` 바로 위

```javascript
// (추가) "시작"
// 재생목록 id를 가진 이름을 모아두는 Set
let 재생목록_보유 = new Set()



// 명단/이름.js 파일 1개를 읽고 window.재생목록 값을 돌려주는 함수
function 명단_읽기(이름)
{
	return new Promise(resolve =>
	{
		// 이전 파일 값과 섞이지 않게 초기화
		delete window.재생목록

		const script = document.createElement("script")
		script.src = "명단/" + 이름 + ".js"
		script.addEventListener("load", () =>
		{
			const 자료 = window.재생목록
			script.remove()
			resolve(自料)
		})
		script.addEventListener("error", () =>
		{
			script.remove()
			resolve(null)
		})
		document.head.appendChild(script)
	})
}



// 읽어온 자료 안에 재생목록인가()가 참인 id가 1개라도 있는지 확인하는 함수
function 재생목록_있나(자료)
{
	if (!자료)
		return false

	for (const 종류 of Object.keys(자료))
	{
		if (!Array.isArray(자료[종류]))
			continue

		for (const 동영상 of 자료[종류])
		{
			if (!동영상.id)
				continue

			try
			{
				const 값 = new URL(동영상.id).searchParams.get("list")
				if (값 && 재생목록인가(값))
					return true
			}
			catch
			{
			}
		}
	}
	return false
}



// 이름 목록 전체를 한번씩 읽어서 재생목록_보유에 채우는 함수
async function 재생목록_보유_조사()
{
	const 이름_모음 = new Set(이름_목록.map(누구 => 누구.이름.trim()))

	for (const 이름 of 이름_모음)
	{
		const 자료 = await 명단_읽기(이름)
		if (재생목록_있나(자료))
			재생목록_보유.add(이름)
	}

	// 나중에 이름표를 눌러 파일을 다시 읽을 때 값이 섞이지 않게 정리
	delete window.재생목록
}
// (추가) "종료"
```

위 코드에서 `resolve(自料)`는 오타입니다. 실제로는 `resolve(자료)`로 써야 합니다.

## 2. 이름표 표시 수정

**파일**: `js/명령.js`
**위치**: `function 채우기_이름표들(왼쪽_이름)` 내부, `이름표.textContent = ...` 행

```javascript
// (수정)
// 중복이면 "*", 재생목록을 가지고 있으면 "**"을 붙임 (둘 다 해당하면 "***")
이름표.textContent = 누구.이름 + (누구.중복 ? "*" : "") + (재생목록_보유.has(누구.이름.trim()) ? "**" : "")
```

## 3. 최초 실행 시 조사를 먼저 하도록 수정

**파일**: `js/명령.js`
**위치**: 파일 맨 마지막 `function render_switch()`

```javascript
// (수정)
// 함수 안에서 await를 쓰기 위해 async 추가
async function render_switch()
{
	const 왼쪽_이름 = document.getElementById("왼쪽_이름")

	채우기_가나다(왼쪽_이름)

	// (추가)
	// 이름표를 만들기 전에 모든 명단 파일을 한번씩 읽어서 재생목록 보유 여부를 확인
	await 재생목록_보유_조사()

	채우기_이름표들(왼쪽_이름)
}
```

맨 아래의 `render_switch()` 호출은 그대로 두면 됩니다.

## 참고

- 조사 대상에는 `소개`, `원곡`, `커버`, `쇼츠`, `부분`의 모든 id가 포함됩니다. 특정 종류만 보고 싶다면 `재생목록_있나` 안의 `Object.keys(자료)` 부분을 바꾸면 됩니다.
- `명단/마레 플로스.js`처럼 이름에 공백이 있는 파일도 `이름.trim()` 기준으로 읽으므로 문제없습니다.
- 요청하신 부분은 아니지만, 현재 `id_찾기` 함수에서 재생목록일 때 `return`만 있고 `return id_재생목록`은 주석 처리되어 있습니다. 이 때문에 `id_가공`에서 재생목록 id가 걸러져서 실제 재생 화면에는 재생목록 영상이 안 나올 수 있습니다. 의도하신 것이 아니라면 확인해 보세요.






*/






























































































/*


## 2. `update_page` + `reset_page` + `get_last` + `render_nav` → 페이지네이션 함수 하나로
**위치**: `js/newapi.js`

네 함수 모두 `type_str === "short" ? short_multiple : video_multiple` 삼항 분기를 각자 반복하고 있습니다. `video_multiple`/`short_multiple`을 별개 전역 변수 대신 `{ video: 1, short: 1 }` 객체 하나로 바꾸면, 저 반복되는 분기 로직을 없애고 `paginate(type_str, action)` 형태의 함수 하나로 합칠 수 있습니다. (`prev`/`next`/`reset`/`render` 를 action으로 넘기는 방식)

이게 가장 효과가 큰 통합 후보입니다 — 지금 4개 함수에 걸쳐 같은 조건문이 최소 6번 이상 중복돼 있습니다.

## 3. `click_img` + `resize_section` → 공통 토글 유틸로 추출
**위치**: `js/newapi.js`

둘 다 "현재 클릭된 대상과 일치하는지 비교 → `classList.toggle`" 패턴이 동일합니다. 대상 선택자와 비교 함수만 받는 `toggle_active(nodeList, target, compare_fn)` 같은 헬퍼로 감쌀 수 있습니다. (단, 효과는 2번보다 작음)

## 4. `wait_cued` + `load_player`의 `player_ready` 패턴 → 공통 대기 유틸
**위치**: `js/newapi.js` (`load_player`/`onYouTubeIframeAPIReady` 쪽과 `onPlayerStateChange`/`cue_intro` 쪽)

"resolve 함수를 전역에 저장해두고 특정 이벤트에서 호출" 하는 구조가 `player_ready_resolve`와 `playlist_ready_resolve` 두 군데에 거의 똑같이 존재합니다. `wait_for_state(state)` 하나로 합쳐서 재사용할 수 있습니다.

---

가장 먼저 손보면 좋은 순서는 **2번(페이지네이션) → 1번(get_id 통합) → 4번 → 3번** 입니다. 원하시면 2번부터 실제 코드로 반영해드릴까요?



이전에 제안한 4가지(get_id/get_list_id, 페이지네이션 4종, click_img/resize_section, wait 패턴) 외에 실제 로드되는 `js/newapi.js`, `data/call.js`, `anne/anne.js`를 더 살펴보면 아래 후보들이 있습니다.

## 5. `anne/anne.js` — `alert_btn` / `help_btn` 클릭 핸들러
**위치**: `anne/anne.js` 파일 전체 (두 개의 `addEventListener("click", ...)` 블록)

fetch할 파일 경로, 배경색, 글자색만 다르고 팝업을 여는 로직은 완전히 동일합니다.

```js
// 통합 예시 (수정)
function show_popup(file, bg, color)
{
	return async () =>
	{
		popup.style.background = bg
		popup.style.color = color
		popup_txt.textContent = await fetch(file).then(res => res.text())
		popup.classList.add("active")
	}
}

document.getElementById("alert_btn").addEventListener("click", show_popup("anne/anne.txt", "#ffffff", "#000000")) // (수정)
document.getElementById("help_btn").addEventListener("click", show_popup("anne/ctrl.txt", "#000000", "var(--highlight)")) // (수정)
```

## 6. `make_list` 안의 "모두 / 원곡 / 커버" 3블록
**위치**: `js/newapi.js`, `make_list` 함수 내부 `type.type === "video"` 조건문 안

`h1_class_all`, `h1_class_original`, `h1_class_cover` 세 블록이 라벨 텍스트와 클릭 시 넘길 데이터만 다르고 나머지(div/span 생성, textContent, addEventListener)는 동일합니다. `[{label:"모두", data:...}, {label:"원곡", data:list_ori}, {label:"커버", data:list_non}].forEach(...)` 형태로 압축 가능합니다.

## 7. `render_nav` 안의 `num_prev` / `num_curr` / `num_next` 생성부
**위치**: `js/newapi.js`, `render_nav` 함수 마지막 부분

세 개의 `createElement("div")` + `className` + `dataset.type` + `textContent` + `appendChild`가 값만 다르고 구조가 동일합니다. `[["num_prev", ...], ["num_curr", ...], ["num_next", ...]].forEach(...)`로 묶을 수 있습니다.

## 8. `btn_prev_txt` / `btn_next_txt` 클릭 핸들러
**위치**: `js/newapi.js`, `make_list` 함수 내부

"short면 short_multiple, 아니면 video_multiple을 ±1 하고 경계 체크 후 render_nav+update_page 호출"하는 로직이 prev(−1, `Math.max(1,...)`)와 next(+1, `last` 체크)로 방향만 다를 뿐 거의 같습니다. 6번 제안(페이지네이션 통합)과 묶으면 `change_page(type_str, delta)` 하나로 흡수됩니다.

## 9. `update_name` / `update_title` (`make_long` 내부)
**위치**: `js/newapi.js`, `make_long` 함수 내부

`playlist.part.forEach → get_songs(video).forEach → lang 조건 검사` 구조가 동일하고, `update_title`은 여기에 `name_match` 조건과 `titles` 대신 `names` Set만 다릅니다. 필터 조건 배열(`[{key:"lang"}, {key:"name"}]`)을 받는 `collect_field(select_target, filters, field)` 형태로 합칠 수 있습니다.

## 10. `apply_color` (`data/call.js`)
**위치**: `data/call.js`, `apply_color` 함수

`if (color.bg) ...`, `if (color.box) ...`, `if (color.highlight) ...` 세 줄이 반복문으로 축약 가능합니다.

```js
// 통합 예시 (수정)
function apply_color(color)
{
	if (!color) return

	const root = document.documentElement.style
	const map = { bg: "--bg", box: "--box", highlight: "--highlight" } // (추가)

	Object.entries(map).forEach(([key, prop]) => // (수정)
	{
		if (color[key]) root.setProperty(prop, color[key])
	})
}
```

---

효과 크기로 보면 **6, 7, 9번**이 코드량을 가장 많이 줄여주고, **5, 10번**은 작지만 손이 덜 가는 안전한 통합입니다. 원하시면 이 중 하나를 실제 코드로 반영해드릴까요?


*/
















































































































/*




목록 페이지 관련들 가능하면 함수 내부 함수 형태로 통합을 시도할것







// 이전/중앙/다음 버튼 영역을 상태에 맞게 다시 그리는 공통 함수
function 채우기_페이지_버튼(이거)
{
	const 버튼_이전 = document.querySelector(".버튼_이전[data-종류=" + 이거 + "]")
	const 버튼_지금 = document.querySelector(".버튼_지금[data-종류=" + 이거 + "]")
	const 버튼_다음 = document.querySelector(".버튼_다음[data-종류=" + 이거 + "]")

	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return

	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")

	const 페이지_수 = 페이지_최대(이거)

	if (페이지_수 <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const multiple = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상

	버튼_이전_문자열.textContent = multiple === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = multiple >= 페이지_수 ? "" : "다음"

	const 이전_숫자 = document.createElement("div")
	이전_숫자.className = "이전_숫자"
	이전_숫자.dataset.종류 = 이거
	이전_숫자.textContent = multiple === 1 ? "" : multiple - 1
	버튼_지금.appendChild(이전_숫자)

	const 지금_숫자 = document.createElement("div")
	지금_숫자.className = "지금_숫자"
	지금_숫자.dataset.종류 = 이거
	지금_숫자.textContent = multiple
	버튼_지금.appendChild(지금_숫자)

	const 다음_숫자 = document.createElement("div")
	다음_숫자.className = "다음_숫자"
	다음_숫자.dataset.종류 = 이거
	다음_숫자.textContent = multiple + 1 > 페이지_수 ? "" : multiple + 1
	버튼_지금.appendChild(다음_숫자)
}




// multiple 값에 맞는 범위만 썸네일 표시/숨김
function 페이지_재구성(이거)
{
	const 숫자 = 이거_몇칸임[이거]
	if (!숫자)
		return

	const multiple = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
	const 숫자_최소 = (multiple - 1) * 숫자
	const 숫자_최대 = (multiple * 숫자) - 1

	const 그거 = document.querySelectorAll(".버튼[data-종류=" + 이거 + "]")
	for (const 버튼 of 그거)
	{
		const 번호 = +버튼.dataset.숫자
		const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
		버튼.style.display = 몇번 ? "" : "none"

	}
}






function 채우기_페이지_버튼(이거)
{
	// (추가) 시작 — 페이지_재구성 함수 내용을 이 함수 앞부분으로 병합
	const 숫자 = 이거_몇칸임[이거]
	if (숫자)
	{
		const multiple_재구성 = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
		const 숫자_최소 = (multiple_재구성 - 1) * 숫자
		const 숫자_최대 = (multiple_재구성 * 숫자) - 1

		const 그거 = document.querySelectorAll(".버튼[data-종류=" + 이거 + "]")
		for (const 버튼 of 그거)
		{
			const 번호 = +버튼.dataset.숫자
			const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
			버튼.style.display = 몇번 ? "" : "none"
		}
	}
	// (추가) 종료

	const 버튼_이전 = document.querySelector(".버튼_이전[data-종류=" + 이거 + "]")
	// ... 이하 기존 코드 그대로 ...
}



// (삭제) 시작
// function 페이지_재구성(이거)
// {
// 	const 숫자 = 이거_몇칸임[이거]
// 	if (!숫자)
// 		return
//
// 	const multiple = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
// 	const 숫자_최소 = (multiple - 1) * 숫자
// 	const 숫자_최대 = (multiple * 숫자) - 1
//
// 	const 그거 = document.querySelectorAll(".버튼[data-종류=" + 이거 + "]")
// 	for (const 버튼 of 그거)
// 	{
// 		const 번호 = +버튼.dataset.숫자
// 		const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
// 		버튼.style.display = 몇번 ? "" : "none"
// 	}
// }
// (삭제) 종료


*/