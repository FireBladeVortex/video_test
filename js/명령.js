
// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// document.head.appendChild(api)

let api_준비_대기 = null
const api_준비 = new Promise(resolve => { api_준비_대기 = resolve })

let player = null
// iframe 호출할 때
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width : "100%",
		height : "100%",
		videoId : "",
		playerVars :
		{
			// 다음 자동재생 방지
			autoplay : 0,
			// 영상 종료 때 추천 방지
			rel : 0,
			// 풀 스크린 버튼 숨김
			// fs : 0,
			// 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			disablekb : 1,
			// 유튜브 일부 ui 숨김
			// controls : 0,
			// 자막 한글 + pip 모드 제작 대비
			// cc_lang_pref : "ko",
			// 자막 자동 실행 + pip 모드 제작 대비
			// cc_load_policy : 1,
		},

		// 현재 상태 불러오기
		events :
		{
			onReady : () =>
			{
				player.setVolume(+볼륨_조절.value)
				api_준비_대기()
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



///////////////////////////////////////////////////////////////////////////////////////////////////


function 재생_표시줄()
{
	const 지금_시간 = player.getCurrentTime()
	const 비율 = (지금_시간 - 시간_관리.시작) / (시간_관리.종료 - 시간_관리.시작)
	document.getElementById("재생_시간_지금").style.width = (Math.max(0, Math.min(1, 비율)) * 100) + "%"

	// const [, 지금_문자열] = 시간_표기법(지금_시간)
	// if (문자열_관리.종료 && 문자열_관리.시작)
	// {
	// 	if (시간_관리.시작 === 0)
	// 	{
	// 		document.getElementById("동영상_제목").textContent = 지금_문자열 + "<" + 문자열_관리.종료
	// 	}
	// 	else
	// 	{
	// 		document.getElementById("동영상_제목").textContent = 문자열_관리.시작 + "< + 지금_문자열 + ">" + 문자열_관리.종료
	// 	}
	// }
}


async function 불러오기_제목(id)
{
	const 주소_1 = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
	const 주소_2 = id
	const 주소_3 = "&format=json"
	const 주소 = 주소_1 + 주소_2 + 주소_3
	try
	{
		const 호출 = await fetch(주소)
		const 데이터 = await 호출.json()

		선택한_채널.이름 = 데이터.author_name
		선택한_채널.주소 = 데이터.author_url
		선택한_동영상.제목 = 데이터.title
		// document.title = 선택한_채널.이름

		if (arguments.length !== 1)
			return

		document.getElementById("동영상_제목").style.textAlign = "start"
		document.getElementById("동영상_제목").textContent = 선택한_동영상.제목
	}
	catch
	{
	}
}



// 재생 종료
// YT.PlayerState.ENDED === 0
// 재생 중
// YT.PlayerState.PLAYING === 1
// 재생 일시 중지
// YT.PlayerState.PAUSED === 2
// 재생 하기위한 준비 중
// YT.PlayerState.BUFFERING === 3
// 재생 하기위한 준비 완료
// YT.PlayerState.CUED === 5

const 재생 = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const 일시중지 = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
// !재생중() === !재생() && !일시중지()
const 재생중 = () => 재생() || 일시중지()

function 재생_일시중지_조작()
{
	if (재생())
	{
		player.pauseVideo()
	}
	else if (일시중지())
	{
		player.playVideo()
	}
}

// 동영상 상태 변화 감지에서 사용할 재생 표시줄 변수
let 재생_시간_표시줄 = null
// 동영상 상태가 변하면 즉시 작동
function onPlayerStateChange(event)
{
	if (event.data === 5 && 재생목록_대기)
	{
		재생목록_대기()
		재생목록_대기 = null
		return
	}

	if (event.data === 5)
	{
		player.setPlaybackRate(1)
		if (시간_관리.종료 === 0)
		{
			[시간_관리.종료, 문자열_관리.종료] = 시간_표기법(player.getDuration())
		}
		let title = null
		try
		{
			title = player.getVideoData().title
		}
		catch
		{
		}
		if (title)
		{
			document.getElementById("동영상_제목").style.textAlign = "start"
			document.getElementById("동영상_제목").textContent = title
			불러오기_제목(선택한_동영상.id, title)
		}
		else
		{
			불러오기_제목(선택한_동영상.id)
		}
	}

	if (event.data === 1)
	{
		if (player.getCurrentTime() < 시간_관리.시작)
		{
			player.seekTo(시간_관리.시작, true)
		}
		clearInterval(재생_시간_표시줄)
		재생_시간_표시줄 = setInterval(재생_표시줄, 100)
	}
	else
	{
		clearInterval(재생_시간_표시줄)
	}

	if (event.data === 0)
	{
		player.seekTo(시간_관리.시작, true)
		player.playVideo()
	}

	const 상태 = [1, 2, 3].includes(event.data)
	const 오른쪽 = document.querySelectorAll("#오른쪽")
	for (const 화면 of 오른쪽)
	{
		화면.style.cursor = 상태 ? "pointer" : "default"
		화면.onclick = 상태 ? 재생_일시중지_조작 : null
	}
}



// 만들기 보류
function 재생_속도_조절(키, 증감)
{

}



function 소리_크기_값_조절(증감)
{
	const 지금소리크기 = player.getVolume()
	const 올려내려 = 증감 > 0
		? Math.floor(지금소리크기 / 5) * 5 + 5
		: Math.ceil(지금소리크기 / 5) * 5 - 5
	const 범위 = Math.min(100, Math.max(0, 올려내려))
	player.setVolume(범위)
	볼륨_조절.value = 범위
}



const 볼륨 = document.getElementById("볼륨")
const 볼륨_조절 = document.getElementById("볼륨_조절")

const 조절_반영 = () => player.setVolume(+볼륨_조절.value)
볼륨_조절.addEventListener("input", 조절_반영)

const 방지 = 간섭 => 간섭.stopPropagation()
볼륨.addEventListener("mousedown", 방지)
볼륨.addEventListener("click", 방지)



function 키_입력(키)
{
	const 증가 = 키.code === "NumpadAdd" || 키.code === "ArrowUp"
	const 감소 = 키.code === "NumpadSubtract" || 키.code === "ArrowDown"
	// const 컨트롤_쉬프트 = 키.ctrlKey || 키.shiftKey

	// if (!컨트롤_쉬프트)
	// {
		if (증가)
		{
			키.preventDefault()
			소리_크기_값_조절(+5)
		}
		else if (감소)
		{
			키.preventDefault()
			소리_크기_값_조절(-5)
		}
	// }
	// else if (컨트롤_쉬프트 && 증가 || 감소)
	// {
	// 	키.preventDefault()
	// }

	if (!player || !재생중())
		return

	// 키 반복입력 방지
	if (!키.repeat)
	{
		if (키.code === "Space")
		{
			키.preventDefault()
			재생_일시중지_조작()
		}
		else if (키.code === "ArrowLeft")
		{
			키.preventDefault()
			player.seekTo(Math.max(시간_관리.시작, player.getCurrentTime() - 5), true)
		}
		else if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(시간_관리.종료, player.getCurrentTime() + 5), true)
		}
		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = 시간_관리.시작 + Math.floor((시간_관리.종료 - 시간_관리.시작) * 비율)
			player.seekTo(숫자키, true)
		}

		// 재생 속도 조절 보류
		// else if (컨트롤_쉬프트 && 증가 || 감소)
		// {
		// 	키.preventDefault()
		// 	const 증감 = 증가 ? 0.05 : -0.05
		// 	const 제한 = 증가 ? 2 : 0.25
		// 	const 최대최소  = 증가 ? Math.min : Math.max
		// 	player.setPlaybackRate(최대최소(제한, (player.getPlaybackRate() + 증감)))
		// }
		// else if (키.code === "Numpad0")
		// {
		// 	키.preventDefault()
		// 	player.setPlaybackRate(1)
		// }
	}
}
document.addEventListener("keydown", 키_입력)



// 마우스 휠로 소리 크기 조절 및 오작동 방지
function 드르륵(마우스휠)
{
	마우스휠.preventDefault()
	소리_크기_값_조절(마우스휠.deltaY < 0 ? +5 : -5)
}
document.addEventListener("wheel", 드르륵, { passive : false })


///////////////////////////////////////////////////////////////////////////////////////////////////



document.getElementById("처음으로").addEventListener("click", () =>
{
	location.reload()
})


const 밀리초 = 3000
const 횟수 = 3

let 연속 = null
let 기억 = 0
let 제한시간 = 0
let 기회 = false

function 도구()
{
	const 조사 = document.getElementById("조사하기")
	조사.style.zIndex = 5
	// location.reload()
}

function 부르기(키)
{
	if (기회)
		return

	if (키.repeat)
		return

	const 입력 = 키.key

	if (입력 !== ".")
	{
		기억 = 0
		return
	}

	const now = Date.now()

	if (기억 > 0 && now - 제한시간 > 밀리초)
	{
		기억 = 0
	}

	if (기억 > 0 && 입력 === 연속)
	{
		기억++
	}
	else
	{
		연속 = 입력
		기억 = 1
		제한시간 = now
	}

	if (기억 === 횟수)
	{
		기억 = 0
		기회 = true
		도구()
	}
}
document.addEventListener("keydown", 부르기)


///////////////////////////////////////////////////////////////////////////////////////////////////



// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function 시간_표기법(시간)
{
	// 시간 메세지 표기법 정리 24:00:00
	function 시분초_표준(시분초)
	{
		const 시간_길이 = 시분초.findIndex(값 => 값 !== 0)
		const 시간_길이_확인 = 시간_길이 === -1 ? 시분초.length - 1 : 시간_길이
		const 시간_정리 = 시분초.slice(시간_길이_확인)
		const 시간_변환 = 시간_정리.map((값, 순서) => 순서 === 0 ? (값 + "") : (값 + "").padStart(2,"0"))
		const 결과 = 시간_변환.join(":")
		return 결과
	}

	// 숫자 모양인 시간 값이 들어왔을 떄
	if (typeof 시간 === "number" && 시간 > 0)
	{
		const 표준시간 = new Date(시간 * 1000)
		const 시 = 표준시간.getUTCHours()
		const 분 = 표준시간.getUTCMinutes()
		const 초 = 표준시간.getUTCSeconds()
		const 시간_숫자 = 시간
		const 시간_문자 = 시분초_표준([시, 분, 초])
		return [ 시간_숫자, 시간_문자 ]
	}

	// 문자열 모양 시간 값이 들어왔을 때
	if (typeof 시간 === "string")
	{
		const 오타확인 = 시간.replace(/;/g, ":")
		const 재확인 = 오타확인.includes(":")
		if (재확인)
		{
			const 시분초 = 오타확인.split(":")
			const 초 = +(시분초.pop())
			const 분 = 시분초.length ? +(시분초.pop()) : 0
			const 시 = 시분초.length ? +(시분초.pop()) : 0
			const 시간_숫자 = 시 * 3600 + 분 * 60 + 초
			const 시간_문자 = 시분초_표준([시, 분, 초])
			return [ 시간_숫자, 시간_문자 ]
		}
	}

	return [ 0, 0 ]
}



///////////////////////////////////////////////////////////////////////////////////////////////////








































































function 만들기_부분(본문, 크기_계산, 페이지)
{
	if (!임시_목록.부분)
		return

	function 구역_찾기(종류)
	{
		return document.querySelector(".구역[data-종류=" + 종류 + "]")
	}

	const 구역_동영상 = 구역_찾기("동영상")
	const 구역_쇼츠 = 구역_찾기("쇼츠")
	const 구역 = 구역_찾기("부분")
	if (!구역)
		return

	function 드롭다운()
	{
		if (!구역_동영상 && !구역_쇼츠)
			return

		const 안내표시줄 = document.createElement("section")
		안내표시줄.className = "안내표시줄"
		구역.appendChild(안내표시줄)

		const 안내_문자열 = document.createElement("span")
		안내_문자열.className = "안내"
		안내_문자열.textContent = "추천 🔼⬆⏫"
		안내표시줄.appendChild(안내_문자열)

		const 드롭다운_공간 = document.createElement("section")
		드롭다운_공간.className = "드롭다운_공간"
		본문.appendChild(드롭다운_공간)

			const 드롭다운_칸 = document.createElement("div")
			드롭다운_칸.className = "드롭다운_칸"
			드롭다운_공간.appendChild(드롭다운_칸)

			const 선택지 = document.createElement("select")
			선택지.className = "드롭다운_선택"
			드롭다운_칸.appendChild(선택지)

			// "노래 골라" 선택지_가짜 (열면 사라지고, 선택 없이 닫으면 다시 보임)
			const 선택지_가짜 = document.createElement("option")
			선택지_가짜.value = ""
			선택지_가짜.textContent = "노래 골라"
			선택지_가짜.selected = true
			선택지_가짜.disabled = true
			선택지_가짜.hidden = true
			선택지.appendChild(선택지_가짜)

			for (let 순서 = 0 ; 순서 < 임시_목록.부분.length ; 순서++)
			{
				const 노래 = 임시_목록.부분[순서]
				const 항목 = document.createElement("option")
				항목.value = 순서 + ""
				항목.textContent = 노래.이름 + "\t" + 노래.제목
				선택지.appendChild(항목)
			}

			const 재생 = document.createElement("button")
			재생.className = "재생_시작_버튼"
			재생.textContent = "재생 시작"
			재생.disabled = true
			드롭다운_칸.appendChild(재생)

		// 선택지를 고르면 재생 버튼 활성화
		선택지.addEventListener("change", () =>
		{
			재생.disabled = 선택지.value === ""
		})

		// 선택한 노래의 id, 시작, 종료로 cueVideoById 실행
		재생.addEventListener("click", () =>
		{
			const 노래 = 임시_목록.부분[+선택지.value]
			if (!노래)
				return

			이미지_클릭_강조("드롭다운")
			선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
		})
	}

	// 노래를 페이지 형태로 모두 보여주는 목록 (한 줄 = 이름 200px | 제목 | 재생 시작 100px)
	function 만들기_노래_목록()
	{
		크기_계산.inert = 구역.dataset.크기 !== "커짐"

		for (let 번호 = 0 ; 번호 < 임시_목록.부분.length ; 번호++)
		{
			const 노래 = 임시_목록.부분[번호]
			const 몇번 = (번호 + "").padStart(3, "0")

			const 항목 = document.createElement("div")
			항목.className = "노래_항목"
			항목.dataset.종류 = "부분"
			항목.dataset.숫자 = 몇번
			페이지.appendChild(항목)

			const 칸_이름 = document.createElement("span")
			칸_이름.className = "노래_칸 노래_이름"
			칸_이름.textContent = 노래.이름
			항목.appendChild(칸_이름)

			const 칸_제목 = document.createElement("span")
			칸_제목.className = "노래_칸 노래_제목"
			칸_제목.textContent = 노래.제목
			항목.appendChild(칸_제목)

			const 칸_재생 = document.createElement("button")
			칸_재생.className = "노래_칸 노래_재생"
			항목.appendChild(칸_재생)

			const 재생 = document.createElement("span")
			재생.className = "재생_시작_버튼"
			재생.textContent = "재생 시작"
			칸_재생.appendChild(재생)
			재생.addEventListener("click", () =>
			{
				이미지_클릭_강조("부분" + 몇번)
				선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
			})
		}
	}

	구역.dataset.크기 = "작아짐"
	드롭다운()
	만들기_노래_목록()

}











const 이거_몇칸임 = { 동영상 : 0, 쇼츠 : 0, 부분 : 0 }
let 총몇칸 = null
function 크기_감지(구역)
{
	for (const 목록 of 구역)
	{
		const 쇼츠 = 목록.target.classList.contains("쇼츠")
		const 부분 = 목록.target.classList.contains("부분")
		const 종류 = 쇼츠 ? "쇼츠" : 부분 ? "부분" : "동영상"

		if (부분)
		{
			const 세로_몇칸 = Math.floor((목록.contentBoxSize[0].blockSize + 3) / 33)
			총몇칸 = 세로_몇칸
		}
		else
		{
			const 설정 = getComputedStyle(document.documentElement)
			const 가로값 = parseInt(설정.getPropertyValue("--가로"))
			const 세로값 = parseInt(설정.getPropertyValue("--세로"))

			const 쇼츠_가로 = 쇼츠 ? 세로값 : 가로값
			const 쇼츠_세로 = 쇼츠 ? 가로값 : 세로값

			const 너비 = 목록.contentBoxSize[0].inlineSize
			const 높이 = 목록.contentBoxSize[0].blockSize

			const 가로 = Math.floor(너비 / 쇼츠_가로)
			const 세로 = Math.floor(높이 / 쇼츠_세로)
			const 몇칸 = 가로 * 세로

			총몇칸 = 몇칸
		}

		이거_몇칸임[종류] = 총몇칸
		페이지_관리[종류] = 1
		페이지_갱신(종류)
	}
}
const 재구성 = new ResizeObserver(크기_감지)



function 페이지_재구성(종류)
{
	const 숫자 = 이거_몇칸임[종류]
	if (!숫자)
		return

	const 페이지_지금 = 페이지_관리[종류]
	const 숫자_최소 = (페이지_지금 - 1) * 숫자
	const 숫자_최대 = (페이지_지금 * 숫자) - 1

	const 불러올거 = ".버튼[data-종류=" + 종류 + "], .노래_항목[data-종류=" + 종류 + "]"
	const 그거 = document.querySelectorAll(불러올거)
	for (const 버튼 of 그거)
	{
		const 번호 = +버튼.dataset.숫자
		const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
		버튼.style.display = 몇번 ? "" : "none"
	}
}



function 페이지_최대(종류)
{
	const 숫자 = 이거_몇칸임[종류]
	if (!숫자)
		return 1

	const 몇개 = 종류 === "부분"
		? document.querySelectorAll(".노래_항목").length
		: 임시_목록[종류].length
	return Math.ceil(몇개 / 숫자)
}



function 채우기_페이지_버튼(종류)
{
	function 페이지_버튼_찾기(종류, 위치)
	{
		return document.querySelector(".버튼_" + 위치 + "[data-종류=" + 종류 + "]")
	}
	const 버튼_이전 = 페이지_버튼_찾기(종류, "이전")
	const 버튼_지금 = 페이지_버튼_찾기(종류, "지금")
	const 버튼_다음 = 페이지_버튼_찾기(종류, "다음")

	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return

	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")

	const 페이지_수 = 페이지_최대(종류)

	if (페이지_수 <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const 페이지_지금 = 페이지_관리[종류]

	버튼_이전_문자열.textContent = 페이지_지금 === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = 페이지_지금 >= 페이지_수 ? "" : "다음"

	const 페이지_앞_지금_뒤 = ["이전_숫자", "지금_숫자", "다음_숫자"]
	for (let 한장_차이 = -1 ; 한장_차이 <= +1 ; 한장_차이++)
	{
		const 페이지_숫자 = 페이지_지금 + 한장_차이

		const 숫자 = document.createElement("span")
		숫자.className = 페이지_앞_지금_뒤[한장_차이 + 1]
		숫자.dataset.종류 = 종류
		숫자.textContent = (페이지_숫자 < 1 || 페이지_숫자 > 페이지_수) ? "" : 페이지_숫자
		버튼_지금.appendChild(숫자)
	}
}





const 선택한_동영상 = { id : null, 제목 : null }
const 선택한_채널 = { 이름 : null, 주소 : null }

const 시간_관리 = { 시작 : null, 종료 : null }
const 문자열_관리 = { 시작 : null, 종료 : null }

const 페이지_관리 = { 동영상 : 1, 쇼츠 : 1, 부분 : 1 }



function 페이지_갱신(종류)
{
	채우기_페이지_버튼(종류)
	페이지_재구성(종류)
}



function 선택한_동영상_준비(id, start = 0, end = 0)
{
	선택한_동영상.id = id

	if (arguments.length === 1)
		return 선택한_동영상.id

	const 시작 = 시간_표기법(start)
	시간_관리.시작 = 시작[0]
	문자열_관리.시작 = 시작[1]

	const 종료 = 시간_표기법(end)
	시간_관리.종료 = 종료[0]
	문자열_관리.종료 = 종료[1]

	player.cueVideoById(
	{
		videoId : 선택한_동영상.id,
		startSeconds : 시간_관리.시작,
		...(시간_관리.종료 > 0 && {endSeconds : 시간_관리.종료})
	})
}



let 이미지_클릭함 = null
function 이미지_클릭_강조(이거)
{
	const 버튼 = document.querySelectorAll(".버튼")
	for (const 딸깍 of 버튼)
	{
		const 그거 = 딸깍.dataset.종류 + 딸깍.dataset.숫자
		const 클릭 = 그거 === 이거
		딸깍.classList.toggle("강조", 클릭)
		딸깍.classList.toggle("발기", !클릭)
	}
	이미지_클릭함 = 이거
}



function 채우기_페이지(종류)
{
	const 페이지 = document.querySelector(".페이지." + 종류)
	if (!페이지)
		return

	const 동영상들 = 임시_목록[종류]
	if (!동영상들)
		return

	for (let 숫자 = 0 ; 숫자 < 동영상들.length ; 숫자++)
	{
		const 동영상 = 동영상들[숫자]
		if (!동영상)
			continue

		const 버튼 = document.createElement("button")
		버튼.className = "버튼"
		버튼.dataset.종류 = 종류
		const 몇번 = (숫자 + "").padStart(3, "0")
		버튼.dataset.숫자 = 몇번

		const img = document.createElement("img")
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = 동영상.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		페이지.appendChild(버튼)

		function 딸깍()
		{
			const 그거 = 종류 + 몇번
			if (그거 === 이미지_클릭함)
			{
				// if (재생())
				// {
				// 	player.pauseVideo()
				// }
				// else if (일시중지())
				// {
				// 	player.playVideo()
				// }
				// else
					return
			}
			else
			{
				이미지_클릭_강조(그거)
				const 쇼츠 = 종류 === "쇼츠"
				선택한_동영상_준비(동영상.id,
					쇼츠 ? 0 : 동영상.시작,
					쇼츠 ? 0 : 동영상.종료)
			}
		}
		버튼.addEventListener("click", 딸깍)
	}
}




let 구역_커짐 = null
const 구역_비율 = { 동영상 : 2, 쇼츠 : 2, 부분 : 1 }
function 크기_조절(왼쪽, 그거)
{
	const 생성된_구역_확인 = [...왼쪽.querySelectorAll(".구역")]
	const 확인된_구역_종류들 = 생성된_구역_확인.map(구역 => 구역.dataset.종류)

	const 조절_딸깍 = 구역_커짐 === 그거 ? null : 그거

	const 비율들 = 확인된_구역_종류들.map(종류 =>
	{
		if (확인된_구역_종류들.length === 1)
			return "1fr"

		if (조절_딸깍)
			return 종류 === 조절_딸깍 ? "1fr" : "0fr"

		return 구역_비율[종류] + "fr"
	})

	왼쪽.style.gridTemplateRows = 비율들.join(" ")

	구역_커짐 = 조절_딸깍

	const 이거 = document.querySelectorAll(".머리말_크기 .문자열_클릭")
	for (const 크기 of 이거)
	{
		크기.textContent = 크기.dataset.종류 === 구역_커짐 ? "작게" : "크게"
	}

	const 부분_구역 = document.querySelector(".구역[data-종류=부분]")
	if (부분_구역)
	{
		const 커짐 = 구역_커짐 === "부분"
		부분_구역.dataset.크기 = 커짐 ? "커짐" : "작아짐"

		const 드롭다운_칸 = 부분_구역.querySelector(".드롭다운_칸")
		if (드롭다운_칸)
		{
			드롭다운_칸.inert = 커짐
		}

		const 노래_목록 = 부분_구역.querySelector(".크기_계산.부분")
		if (노래_목록)
		{
			노래_목록.inert = !커짐
		}
	}
}



function 만들기_목록()
{
	const 왼쪽 = document.getElementById("왼쪽")

	const 원곡 = 임시_목록.원곡 ?? []
	const 커버 = 임시_목록.커버 ?? []
	const 동영상 = 원곡.concat(커버)
	임시_목록.동영상 = 동영상

	const 쇼츠 = 임시_목록.쇼츠 ?? []
	const 부분 = 임시_목록.부분 ?? []

	const 종류_확인 =
	[
		{ 종류 : "동영상",	자료 : 동영상 },
		{ 종류 : "쇼츠",	자료 : 쇼츠 },
		{ 종류 : "부분",	자료 : 부분 },
	]

	function 유효_재확인(종류)
	{
		return Array.isArray(종류) && 종류.some(동영상 => 동영상.id)
	}

	for (const 분류 of 종류_확인)
	{
		if (!유효_재확인(분류.자료))
			continue

		const 구역 = document.createElement("section")
		구역.className = "구역"
		구역.dataset.종류 = 분류.종류
		왼쪽.appendChild(구역)

		const 머리말 = document.createElement("header")
		머리말.className = "머리말"
		구역.appendChild(머리말)

			const 머리말_재생목록 = document.createElement("span")
			머리말_재생목록.className = "머리말_재생목록"
			머리말_재생목록.textContent = 분류.종류 + " 재생 목록"
			머리말.appendChild(머리말_재생목록)

			const 머리말_구분 = {}
			for (const 이름 of ["종류", "페이지", "크기"])
			{
				const 칸 = document.createElement("menu")
				칸.className = "머리말_" + 이름
				머리말.appendChild(칸)
				머리말_구분[이름] = 칸
			}
				const 크기_조절_문자열 = document.createElement("button")
				크기_조절_문자열.className = "문자열_클릭"
				크기_조절_문자열.textContent = "크게"
				크기_조절_문자열.dataset.종류 = 분류.종류
				머리말_구분.크기.appendChild(크기_조절_문자열)
				크기_조절_문자열.addEventListener("click", () => 크기_조절(왼쪽, 분류.종류))

		if (분류.종류 === "동영상")
		{
			if (유효_재확인(원곡) && 유효_재확인(커버))
			{
				function 미리보기_교체(자료)
				{
					임시_목록.동영상 = 자료

					const 페이지 = document.querySelector(".페이지.동영상")
					if (페이지)
					{
						페이지.innerHTML = ""
					}

					채우기_페이지("동영상")

					페이지_관리.동영상 = 1
					페이지_갱신("동영상")
				}

				const 종류_목록 =
				[
					{ 이름 : "모두", 자료 : 동영상 },
					{ 이름 : "원곡", 자료 : 원곡 },
					{ 이름 : "커버", 자료 : 커버 },
				]
				for (const 종류 of 종류_목록)
				{
					const 종류_버튼 = document.createElement("button")
					종류_버튼.className = "종류_" + 종류.이름
					머리말_구분.종류.appendChild(종류_버튼)

					const 문자열 = document.createElement("span")
					문자열.className = "문자열_클릭"
					문자열.textContent = 종류.이름
					종류_버튼.appendChild(문자열)
					문자열.addEventListener("click", () => 미리보기_교체(종류.자료))
				}
			}
		}

		function 팔락(한장)
		{
			const 페이지_마지막 = 페이지_최대(분류.종류)
			const 페이지_지금 = 페이지_관리[분류.종류]
			const 넘기기 = 페이지_지금 + 한장

			if (넘기기 < 1 || 넘기기 > 페이지_마지막)
				return

			페이지_관리[분류.종류] = 넘기기
			페이지_갱신(분류.종류)
		}

		const 페이지_버튼_종류 =
		[
			{ 넘김 : "이전", 한장 : -1 },
			{ 넘김 : "지금", 한장 : 0 },
			{ 넘김 : "다음", 한장 : +1 },
		]
		for (const 버튼_그거 of 페이지_버튼_종류)
		{
			const 버튼 = document.createElement("button")
			버튼.className = "버튼_" + 버튼_그거.넘김
			버튼.dataset.종류 = 분류.종류
			머리말_구분.페이지.appendChild(버튼)

			if (버튼_그거.한장 === 0)
				continue

			const 문자열 = document.createElement("span")
			문자열.className = "문자열_클릭"
			버튼.appendChild(문자열)
			문자열.addEventListener("click", () => 팔락(버튼_그거.한장))
		}

		const 본문 = document.createElement("section")
		본문.className = "본문"
		구역.appendChild(본문)

		// 몇개 들어가는지 크기 계산만 하는 공간
		const 크기_계산 = document.createElement("div")
		크기_계산.className = "크기_계산 " + 분류.종류
		본문.appendChild(크기_계산)

		// 실질적으로 보여주는 공간
		const 페이지 = document.createElement("div")
		페이지.className = "페이지 " + 분류.종류
		크기_계산.appendChild(페이지)

		if (분류.종류 === "부분")
		{
			만들기_부분(본문, 크기_계산, 페이지)
			continue
		}

		채우기_페이지_버튼(분류.종류)
		채우기_페이지(분류.종류)
	}

	왼쪽.style.gridTemplateRows = [...왼쪽.querySelectorAll(".구역")]
	.map(구역 => 구역_비율[구역.dataset.종류] + "fr")
	.join(" ")

	if (왼쪽.querySelectorAll(".구역").length === 1)
	{
		왼쪽.querySelector(".머리말_크기").style.visibility = "hidden"
		크기_조절(왼쪽, 왼쪽.querySelector(".구역").dataset.종류)
	}
}



function 만들기_구역()
{
	만들기_목록()

	const 크기_계산 = document.querySelectorAll(".크기_계산")
	for (const 감지 of 크기_계산)
	{
		재구성.observe(감지)
	}
}























































//////////////////////////////////////////////////////////////////////////////////////

function id_찾기(주소)
{
	const url = new URL(주소)
	const v = url.searchParams.get("v")
	const path = url.pathname.split("/").pop()
	return v ?? path
}



let 재생목록_대기 = null
function 불러오기_재생목록(이름)
{
	//
	delete window.재생목록
	//


	const script = document.createElement("script")
	script.src = "명단/" + 이름 + ".js"

	function 불러오기_소개(소개)
	{
		if (!소개)
			return

		const 무작위 = 소개[Math.floor(Math.random() * 소개.length)]

		player.cueVideoById(
		{
			videoId : 무작위.id,
		})

	}

	async function id_가공(재생목록)
	{
		// async function 재생목록_조사(id)
		// {
		// 	const 대기 = new Promise(resolve => { 재생목록_대기 = resolve })
		// 	const 시간초과 = new Promise(resolve => setTimeout(resolve, 5000))

		// 	player.cuePlaylist(
		// 	{
		// 		listType : "playlist",
		// 		list : id
		// 	})

		// 	await Promise.race([대기, 시간초과])
		// 	재생목록_대기 = null

		// 	const 재생목록 = player.getPlaylist() ?? []
		// 	const 결과 = 재생목록.map(id => ({ id }))
		// 	return 결과
		// }

		// function 재생목록인가(id)
		// {
		// 	return id.startsWith("PL")
		// }

		// function id_찾기(주소)
		// {
		// 	// 잘못된 것을 받아왔을 때 에러 방지를 위한 try
		// 	try
		// 	{
		// 		// 유효한 링크인지 확인
		// 		const url = new URL(주소)

		// 		// 해당 링크가 재생목록인지 확인
		// 		const id_재생목록 = url.searchParams.get("list")
		// 		// 재생목록이 맞고 PL 타입 재생목록인지 확인하고 맞으면 값을 전달
		// 		if (id_재생목록 && 재생목록인가(id_재생목록))
		// 			// return id_재생목록
		// 			return

		// 		// 해당 링크가 동영상 링크인지 확인
		// 		// 링크 모양에 따라 경우의 수 대비
		// 		const v = url.searchParams.get("v")
		// 		const path = url.pathname.split("/").pop()
		// 		const id_동영상 = v ?? path

		// 		// 잘못된 링크인지 대비
		// 		const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/
		// 		// 잘못됐다면 아무것도 안하고 즉시 null 전달
		// 		if (!정규표현식.test(id_동영상))
		// 			return null

		// 		// 동영상 시작시간을 포함하고있는지 확인
		// 		const t = parseInt(url.searchParams.get("t"))
		// 		// 포함하고 있으면 시간도 같이 전달 아니라면 id만 전달 + NaN 방지
		// 		return (Number.isNaN(t)) ? id_동영상 : [id_동영상, t]
		// 	}
		// 	// try 과정에서 뭔가 잘못됐다면 즉시 멈추고 null 전달
		// 	catch
		// 	{
		// 		return null
		// 	}
		// }


		const keys = Object.keys(재생목록)
		for (const key of keys)
		{
			if (!Array.isArray(재생목록[key]))
				continue

			for (const 동영상 of 재생목록[key])
			{
				//
				if (!동영상.id)
					continue
				//

				const id = id_찾기(동영상.id)
				// const id = id_찾기(동영상.id)
				const 값 = Array.isArray(id) ? id[0] : id
				if (값)
				{
					// if (재생목록인가(값))
					// {
					// 	const 결과 = await 재생목록_조사(값)
					// 	임시_목록[key] = (임시_목록[key] ?? []).concat(결과)
					// }
					// else
					{
						if (key === "부분")
						{
							const 펼침 = (동영상.노래 ?? [])
								.filter(노래 => 노래.이름 && 노래.제목 && 노래.시작 && 노래.종료)
								.map(노래 => ({ id : 값, ...노래 }))
							임시_목록[key] = (임시_목록[key] ?? []).concat(펼침)
							continue
						}
						const { id, ...rest } = 동영상
						임시_목록[key] = (임시_목록[key] ?? []).concat([{ id : 값, ...rest }])
					}
				}
			}
		}
	}



	function 나만의_색깔(색깔)
	{
		if (!색깔)
			return

		const 설정 = document.documentElement.style

		const 색깔_종류 =
		[
			"오른쪽바탕색",
			"왼쪽바탕색",
			"강조1",
			"강조2",
			"강조3",
		]
		for (const 이거 of 색깔_종류)
		{
			if (색깔[이거])
			{
				설정.setProperty("--" + 이거, 색깔[이거])
			}
		}
	}

	async function 불러오기()
	{
		document.head.appendChild(api)
		나만의_색깔(window.재생목록.색깔)
		await api_준비
		await id_가공(window.재생목록)
		await 불러오기_소개(임시_목록.소개)
		만들기_구역()
		document.getElementById("왼쪽_이름").remove()
		document.getElementById("오른쪽_안내").remove()
	}
	script.addEventListener("load", 불러오기)
	document.head.appendChild(script)
}

///////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////

// (추가) "시작"
// 본문에 "불러오는 중" 표시 (스타일은 css 의 #불러오는중)
function 불러오는중(본문)
{
	const 불러오는_중_있냐 = document.getElementById("불러오는중")
	if (불러오는_중_있냐)
		return 불러오는_중_있냐.remove()

	const 불러오는_중 = document.createElement("div")
	불러오는_중.id = "불러오는중"
	불러오는_중.textContent = "불러오는 중"
	본문.appendChild(불러오는_중)
}


// 이름별 확인 결과를 저장하는 전역 객체
// 형태 : { 파일 : true 또는 false, 검사 : id_검사 결과 또는 null }
const 이름들_파일_상태 = {}

// 파일이 실제로 있는지 확인하고, 있으면 id_검사까지 같이 실행
// script 의 error 이벤트가 발생하면 파일이 없는 것으로 판단
function 파일_확인(이름)
{
	return new Promise(resolve =>
	{
		// 이전에 불러온 재생목록이 덮어써지거나 섞이는 것을 방지
		delete window.재생목록

		const script = document.createElement("script")
		script.src = "명단/" + 이름 + ".js"

		script.addEventListener("load", () =>
		{
			// 실행은 됐지만 재생목록이 만들어지지 않았다면 파일이 없는 것과 같이 처리
			if (!window.재생목록)
			{
				script.remove()
				resolve({ 파일 : false, 검사 : null })
				return
			}

			const 결과 = { 파일 : true, 검사 : id_검사(window.재생목록) }
			script.remove()
			delete window.재생목록
			resolve(결과)
		})

		script.addEventListener("error", () =>
		{
			script.remove()
			resolve({ 파일 : false, 검사 : null })
		})

		document.head.appendChild(script)
	})
}
// (추가) "종료"



// (추가) "시작"
// 재생목록의 모든 id 를 new URL 로 검사 (구 재생목록인가 → id_검사 로 이름 변경 후 전역 이동)
// 결과 형태
// { 잘못됨 : { 소개 : [id, ...], ... }, 최신화 : { 커버 : [id, ...], ... } }
function id_검사(재생목록)
{
	const 결과 = { 잘못됨 : {}, 최신화 : {}, 중복 : {} }
	if (!재생목록)
		return 결과

	// 어느 종류에서 나온 id 인지 기억하기 위한 함수
	function 기록_추가(대상, 종류, id)
	{
		대상[종류] ??= []
		대상[종류].push(id)
	}

	const 종류들 = ["소개", "원곡", "커버", "쇼츠", "부분"]
	const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/

	for (const 종류 of 종류들)
	{
		if (!Array.isArray(재생목록[종류]))
			continue

		const 세기 = {}
		for (const 동영상 of 재생목록[종류])
		{
			// 비어있는 id 는 아직 채우지 않은 칸이므로 검사하지 않음
			if (!동영상 || !동영상.id)
				continue

			let url = null
			try
			{
				url = new URL(동영상.id)
			}
			catch
			{
				// 주소 모양 자체가 아님
				기록_추가(결과.잘못됨, 종류, 동영상.id)
				continue
			}

			// list 값이 있으면 재생목록 주소
			if (url.searchParams.get("list"))
			{
				기록_추가(결과.최신화, 종류, 동영상.id)
				continue
			}

			// (추가) "시작"
			// 동영상 id 가 11자리 형식이 아니면 잘못된 주소, 정규표현식을 통과한 id 만 중복 세기
			const id_동영상 = id_찾기(url)
			if (!정규표현식.test(id_동영상))
			{
				기록_추가(결과.잘못됨, 종류, 동영상.id)
				continue
			}

			// 처음 나온 주소를 원본으로 기억하고 횟수를 올림
			세기[id_동영상] ??= { 원본 : 동영상.id, 횟수 : 0 }
			세기[id_동영상].횟수++
			// (추가) "종료"
		}

		for (const 키 of Object.keys(세기))
		{
			if (세기[키].횟수 > 1)
			{
				결과.중복[종류] ??= []
				결과.중복[종류].push(세기[키])
			}
		}
	}

	return 결과
}

// 문제가 하나라도 있는지 확인
function 문제_있음(검사)
{
	if (!검사)
		return false

	return Object.keys(검사.잘못됨).length > 0
		|| Object.keys(검사.최신화).length > 0
		|| Object.keys(검사.중복).length > 0
}

// 기억한 문제를 본문 왼쪽 위부터 출력
function 문제_출력(본문, 검사)
{
	const 분류들 =
	[
		{ 키 : "잘못됨", 제목 : "잘못된 주소" },
		{ 키 : "최신화", 제목 : "최신화 필요" },
		{ 키 : "중복", 제목 : "중복 있음" },
	]

	const 줄들 = []
	for (const 분류 of 분류들)
	{
		const 묶음 = 검사[분류.키]
		const 종류들 = Object.keys(묶음)
		if (종류들.length === 0)
			continue

		줄들.push(분류.제목)
		for (const 종류 of 종류들)
		{
			줄들.push("재생목록." + 종류)
			for (const id of 묶음[종류])
			{
				if (분류.키 === "중복")
				{
					줄들.push("id : " + id.원본 + " " + id.횟수 + "번")
					continue
				}
				줄들.push("id : " + id)
			}
		}
		줄들.push("")
	}

	const 출력 = document.createElement("div")
	출력.className = "문제_출력"
	출력.textContent = 줄들.join("\n")
	본문.appendChild(출력)
}
// (추가) "종료"



////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////



const 가나다순 =
[
	"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
	"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
]
const AtoZ =
[
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
]
const 소속사 = []
function 시작()
{
	async function 채우기_이름표들(왼쪽_이름)
	{
		const 본문 = document.createElement("section")
		본문.className = "본문"
		왼쪽_이름.appendChild(본문)

		//
		불러오는중(본문)
		//

		function 가나다순_정렬(목록)
		{
			const 규칙 = new Intl.Collator("ko")
			const 정렬 = [...목록].sort((앞, 뒤) =>
			{
				const 비교 = 규칙.compare(앞.이름.trim(), 뒤.이름.trim())
				return 비교
			})

			const map = new Map()
			for (const 그거 of 정렬)
			{
				const 이거 = 그거.이름.trim()
				if (map.has(이거))
				{
					map.get(이거).중복 = true
				}
				else
				{
					map.set(이거, { ...그거 })
				}
			}

			const 결과 = [...map.values()]

			return 결과
		}

		const 이름들 = 가나다순_정렬(이름_목록)


		// (추가) "시작"
		// 모든 이름의 파일을 하나씩 순서대로 확인
		// 동시에 불러오면 window.재생목록이 서로 섞이므로 반드시 순서대로 처리
		for (const 누구 of 이름들)
		{
			이름들_파일_상태[누구.이름] = await 파일_확인(누구.이름)
		}
		불러오는중(본문)

		const 이름표들 = document.createElement("menu")
		이름표들.className = "이름표들"
		본문.appendChild(이름표들)
		// (추가) "종료"




		for (const 누구 of 이름들)
		{
			const 이름표 = document.createElement("button")
			이름표.className = "이름표"
			이름표들.appendChild(이름표)

			const 이름 = document.createElement("span")
			이름.className = 누구.이름

			const 상태 = 이름들_파일_상태[누구.이름]
			///////////////////////////////////////////////////////////////////
			let 기호 = ""
			if (!상태.파일)
			{
				기호 = "!"
				이름.classList.add("파일없음")
			}
			else if (문제_있음(상태.검사))
			{
				기호 = "?"
				이름.classList.add("문제있음")
			}
			이름.textContent = (누구.중복 ? 누구.이름 + "+" : 누구.이름) + 기호
			// 이름.textContent = 누구.중복 ? 누구.이름 + "+" : 누구.이름
			이름표.appendChild(이름)

			if (!상태.파일)
				continue

			// 이름.addEventListener("click", () =>
			// {
			// 	본문.innerHTML = ""
			// 	불러오는중(본문)
			// 	불러오기_재생목록(누구.이름)
			// })

			이름.addEventListener("click", () =>
			{
				본문.innerHTML = ""
				document.title = 누구.이름
				불러오는중(본문)
				// (추가) "시작"
				// 문제가 있으면 api 호출 없이 문제 목록만 출력하고 종료
				if (문제_있음(상태.검사))
				{
					문제_출력(본문, 상태.검사)
					return
				}
				// (추가) "종료"

				불러오기_재생목록(누구.이름)
			})
		}
	}

///////////////////////////////////////////////////////////////////////////////////////////////////

	function 채우기_가나다()
	{
		const 가나다 = document.getElementById("가나다")

		for (const 순서대로 of 가나다순)
		{
			const 자음_상자 = document.createElement("button")
			자음_상자.className = "자음_상자"
			가나다.appendChild(자음_상자)

				const 자음 = document.createElement("span")
				자음.className = 순서대로
				자음.textContent = 순서대로
				자음_상자.appendChild(자음)

			const 자음_번호 = document.createElement("button")
			자음_번호.className = "자음_번호"
			가나다.appendChild(자음_번호)

				const 몇개 = document.createElement("span")
				몇개.className = 순서대로
				// 몇개.textContent = 순서대로
				자음_번호.appendChild(몇개)

		}
	}

	채우기_가나다()

	const 왼쪽_이름 = document.getElementById("왼쪽_이름")
	채우기_이름표들(왼쪽_이름)

	const 오른쪽_안내 = document.getElementById("오른쪽_안내")
	// 채우기_안내목록() 추가 함수 필요
	// 채우기_안내문()
}
시작()