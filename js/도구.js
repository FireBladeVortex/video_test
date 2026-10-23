
/*


const 상태_칸 = document.getElementById("상태")
const 결과_칸 = document.getElementById("결과")
const 이름_선택 = document.getElementById("이름_선택")


const 주소_입력 = document.getElementById("주소_입력")
const 종류_선택 = document.getElementById("종류_선택")


let 불러온_값 = []

let 마지막_주소 = ""
let 마지막_비교 = ""
let 타이틀 = null

// (추가)
// 입력창에서 "ㅁㅁㅁ", 구조를 발견했을 때 true, 출력에서 { } 를 생략할지 정하는 변수
let 중괄호_생략 = false




// (추가) "시작"
// 일반 동영상 id 를 cue 시켜서 CUED(5) 상태가 될 때까지 기다린 뒤 제목을 타이틀에 담는 함수
// 재생목록_조사와 같은 재생목록_대기 를 같이 사용하며, onStateChange 에서 5 가 되면 풀림
async function 제목_조사(id)
{
	await api_준비

	타이틀 = null

	const 대기 = new Promise(resolve => { 재생목록_대기 = resolve })
	const 시간초과 = new Promise(resolve => setTimeout(resolve, 5000))

	player.cueVideoById({ videoId : id })

	await Promise.race([대기, 시간초과])
	재생목록_대기 = null

	// 제목이 비어있으면 null 로 처리
	타이틀 = player.getVideoData?.()?.title || null
	return 타이틀
}
// (추가) "종료"




// (추가) "시작"
// 입력창 문자열에서 앞뒤 공백을 지우고, 첫 번째 " 와 그 다음 " 사이의 문자열만 꺼내는 함수
// 아래 3가지 모양 모두 같은 주소를 돌려줌
// id : "https://youtu.be/xxxxxxxxxxx",
// "https://youtu.be/xxxxxxxxxxx",
// 따옴표가 없으면 trim 한 문자열을 그대로 돌려줌
function 문자열_정리(문자열)
{
	const 정리 = 문자열.trim()

	const 앞 = 정리.indexOf("\"")
	if (앞 === -1)
		return 정리

	const 뒤 = 정리.indexOf("\"", 앞 + 1)
	if (뒤 === -1)
		return 정리

	return 정리.slice(앞 + 1, 뒤).trim()
}
// (추가) "종료"


// (추가) "시작"
// 입력창 문자열에서 첫 번째 " 와 그 다음 " 바로 뒤에 , 가 있는지 확인하는 함수
// "ㅁㅁㅁ", 구조이면 true, 따옴표만 있거나 아무것도 없으면 false
function 따옴표_쉼표_확인(문자열)
{
	const 정리 = 문자열.trim()

	const 앞 = 정리.indexOf("\"")
	if (앞 === -1)
		return false

	const 뒤 = 정리.indexOf("\"", 앞 + 1)
	if (뒤 === -1)
		return false

	return 정리[뒤 + 1] === ","
}
// (추가) "종료"








const 이름_모음 = new Set(이름_목록.map(누구 => 누구.이름.trim()))
for (const 이름 of 이름_모음)
{
	const 항목 = document.createElement("option")
	항목.value = 이름
	항목.textContent = 이름
	이름_선택.appendChild(항목)
}

// YouTube API 준비
let player = null
let 재생목록_대기 = null

let api_준비_끝 = null
const api_준비 = new Promise(resolve => { api_준비_끝 = resolve })

function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width : "200",
		height : "200",
		events :
		{
			onReady : () => api_준비_끝(),
			onError : () =>
			{
				if (재생목록_대기)
				{
					재생목록_대기()
					재생목록_대기 = null
				}
			},
			onStateChange : event =>
			{
				if (event.data === 5 && 재생목록_대기)
				{
					재생목록_대기()
					재생목록_대기 = null
				}
			},
		}
	})
}

const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
document.head.appendChild(api)



// 재생목록 안의 영상 id 목록 얻기
async function 재생목록_조사(id)
{
	const 대기 = new Promise(resolve => { 재생목록_대기 = resolve })
	const 시간초과 = new Promise(resolve => setTimeout(resolve, 5000))

	player.cuePlaylist(
	{
		listType : "playlist",
		list : id
	})

	await Promise.race([대기, 시간초과])
	재생목록_대기 = null

	const 재생목록 = player.getPlaylist() ?? []
	const 결과 = 재생목록.map(id => ({ id }))
	return 결과
}



function 재생목록인가(id)
{
	return id.startsWith("PL")
}



// 주소에서 재생목록 id 또는 영상 id 추출
function id_찾기(주소)
{
	try
	{
		const url = new URL(주소)

		const id_재생목록 = url.searchParams.get("list")
		if (id_재생목록 && 재생목록인가(id_재생목록))
			return id_재생목록

		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const id_동영상 = v ?? path

		const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/
		if (!정규표현식.test(id_동영상))
			return null

		return id_동영상
	}
	catch
	{
		return null
	}
}



// // 주소 입력창 → 영상 id 목록
// async function 주소_조사(주소)
// {
// 	const 값 = id_찾기(주소)
// 	if (!값)
// 		return []

// 	if (재생목록인가(값))
// 		return await 재생목록_조사(값)

// 	return [{ id : 값 }]
// }


// (수정)
// 제목_필요 인자 추가 (기존 비교 과정에서는 제목이 필요 없어서 기본값 false)
async function 주소_조사(주소, 제목_필요 = false)
{
	const 값 = id_찾기(주소)
	if (!값)
		return []

	if (재생목록인가(값))
		return await 재생목록_조사(값)

	// (수정) "시작"
	// 제목이 필요하면 cue 시켜서 타이틀을 얻고 영상 정보에 같이 담아서 전달
	if (제목_필요)
	{
		await 제목_조사(값)
		return [{ id : 값, 제목 : 타이틀 }]
	}

	return [{ id : 값 }]
	// (수정) "종료"
}




// 명단/이름.js 에서 선택한 종류의 영상 id 목록 얻기
function 파일_불러오기(이름)
{
	return new Promise(resolve =>
	{
		delete window.재생목록 // 이전 파일 값과 섞이지 않게 초기화

		const script = document.createElement("script")
		script.src = "명단/" + 이름 + ".js"
		script.addEventListener("load", () =>
		{
			const 자료 = window.재생목록
			script.remove()
			resolve(자료)
		})
		script.addEventListener("error", () =>
		{
			script.remove()
			resolve(null)
		})
		document.head.appendChild(script)
	})
}



async function 기존_id_모으기(이름, 종류)
{
	const 자료 = await 파일_불러오기(이름)
	if (!자료 || !Array.isArray(자료[종류]))
		return new Set()

	const 모음 = new Set()

	for (const 동영상 of 자료[종류])
	{
		const 결과 = await 주소_조사(동영상.id ?? "")
		for (const 그것 of 결과)
		{
			모음.add(그것.id)
		}
	}

	return 모음
}


function 결과_출력(값)
{
	const 종류 = 종류_선택.value
	// const 앞 = "\t{\n\t\tid : "
	// const 뒤 = ",\n\t},"

	// const 출력_id = 값.map(동영상 =>
	// {
	// 	const 주소 = "https://youtu.be/" + 동영상.id
	// 	const 결과 = 주소.replace(/^|$/g, "\"")
	// 	return 앞 + 결과 + 뒤
	// }).join("\n")
	// (수정)
	// 앞에 { 줄을 분리하여 제목 주석 줄을 id 바로 윗줄에 끼워 넣을 수 있게 함
	const 앞 = "\t\tid : "
		// (수정)
	const 뒤 = 중괄호_생략 ? "," : ",\n\t},"
	// const 뒤 = ",\n\t},"


	const 출력_id = 값.map(동영상 =>
	{
		const 주소 = "https://youtu.be/" + 동영상.id
		const 결과 = 주소.replace(/^|$/g, "\"")

		// (추가) "시작"
		// 제목이 있는 경우에만 id 윗줄에 주석으로 제목 삽입
		const 제목_줄 = 동영상.제목 ? "\t\t// " + 동영상.제목 + "\n" : ""
		// (추가) "종료"

		// (수정)
		// 여는 중괄호와 제목 줄, id 줄을 순서대로 이어붙임
		// return "\t{\n" + 제목_줄 + 앞 + 결과 + 뒤

				// (추가)
		// 중괄호를 생략할 때는 여는 { 줄을 비움
		const 여는_줄 = 중괄호_생략 ? "" : "\t{\n"

		// (수정)
		// 고정된 "\t{\n" 대신 여는_줄 사용
		return 여는_줄 + 제목_줄 + 앞 + 결과 + 뒤
	}).join("\n")


	if (종류 === "")
		return 출력_id

	const 출력_id에_종류까지 = "재생목록." + 종류 + " =\n[\n" + 출력_id + "\n]"
	return 출력_id에_종류까지
}





function 버튼_잠금(잠금)
{
	document.getElementById("불러오기").disabled = 잠금
	document.getElementById("비교하기").disabled = 잠금
}

function 버튼_갱신()
{
		// (수정)
	// 불러오기 때 저장한 마지막_주소가 정리된 문자열이므로 비교할 때도 같은 방식으로 정리
	const 주소_같음 = 문자열_정리(주소_입력.value) === 마지막_주소
	// const 주소_같음 = 주소_입력.value.trim() === 마지막_주소
	const 비교_같음 = (이름_선택.value + "/" + 종류_선택.value) === 마지막_비교
	const 선택_안함 = 이름_선택.value === "" || 종류_선택.value === ""

	document.getElementById("불러오기").disabled = 주소_같음
	document.getElementById("비교하기").disabled = 불러온_값.length === 0 || 선택_안함 || 비교_같음
	document.getElementById("복사하기").disabled = 결과_칸.textContent === ""

}


document.getElementById("불러오기").addEventListener("click", async () =>
{
	// const 주소 = document.getElementById("주소_입력").value.trim()
		// (수정)
	// 입력창 값을 trim 한 뒤 따옴표 사이의 문자열만 사용
	const 주소 = 문자열_정리(document.getElementById("주소_입력").value)

	// (추가)
	// 입력창에 "ㅁㅁㅁ", 구조가 있었는지 기억 (결과_출력에서 사용)
	중괄호_생략 = 따옴표_쉼표_확인(document.getElementById("주소_입력").value)



	버튼_잠금(true)
	상태_칸.textContent = "불러오는 중"


	const 값 = id_찾기(주소)
	if (값 && 재생목록인가(값))
		await api_준비

	불러온_값 = await 주소_조사(주소, true)
	상태_칸.textContent = "불러온 영상 " + 불러온_값.length + "개"

	결과_칸.textContent = 결과_출력(불러온_값)
	마지막_주소 = 불러온_값.length > 0 ? 주소 : ""
	마지막_비교 = ""
	버튼_갱신()
})



document.getElementById("비교하기").addEventListener("click", async () =>
{
	if (불러온_값.length === 0)
	{
		상태_칸.textContent = "먼저 불러오기를 실행하세요"
		return
	}
	버튼_잠금(true)
	상태_칸.textContent = "비교하는 중"
	await api_준비

	const 기존 = await 기존_id_모으기(이름_선택.value, document.getElementById("종류_선택").value)
	const 새것 = 불러온_값.filter(동영상 => !기존.has(동영상.id))

	상태_칸.textContent = "기존 " + 기존.size + "개 / 새로운 영상 " + 새것.length + "개"
	결과_칸.textContent = 결과_출력(새것)
	마지막_비교 = 이름_선택.value + "/" + 종류_선택.value
	버튼_갱신()
})



document.getElementById("복사하기").addEventListener("click", async () =>
{
	await navigator.clipboard.writeText(결과_칸.textContent)
	상태_칸.textContent = "복사됨"

})

document.getElementById("초기화").addEventListener("click", () =>
{
	location.reload()
})

주소_입력.addEventListener("input", 버튼_갱신)
이름_선택.addEventListener("change", 버튼_갱신)
종류_선택.addEventListener("change", 버튼_갱신)

종류_선택.addEventListener("change", () =>
{
	if (불러온_값.length === 0)
		return

	결과_칸.textContent = 결과_출력(불러온_값)
	버튼_갱신()
})

버튼_갱신()


*/




// (추가) "시작"
// 도구.js 전체 (기존 내용은 모두 삭제하고 아래 내용으로 교체)

const 상태_칸 = document.getElementById("상태")
const 결과_칸 = document.getElementById("결과")
const 주소_입력 = document.getElementById("주소_입력")
const 종류_선택 = document.getElementById("종류_선택")

// 불러온 결과 : [{ 순서, id, 제목 }]
let 결과 = null
// 입력창에서 "ㅁㅁㅁ", 구조를 발견했을 때 true, 출력에서 { } 를 생략할지 정하는 변수
let 중괄호_생략 = false

const 제한시간 = 3000

// (추가) "시작"
// 실패했을 때 다시 시도할 횟수
const 재시도_횟수 = 3

// 실행 함수를 최대 재시도_횟수 번 실행하고, 성공하면 그 결과를 바로 돌려주는 함수
// 실행 함수는 { 성공 : true, 값 : ... } 또는 { 성공 : false, 위치 : "...", 원인 : "..." } 를 돌려줘야 함
// 모두 실패하면 마지막 실패 내용에 재시도 횟수를 덧붙여서 돌려줌
async function 재시도(단계, 실행)
{
	let 마지막 = null

	for (let 시도 = 1 ; 시도 <= 재시도_횟수 ; 시도++)
	{
		마지막 = await 실행()
		if (마지막.성공)
			return 마지막

		// 마지막 시도 뒤에는 다시 하지 않으므로 안내와 대기를 건너뜀
		if (시도 === 재시도_횟수)
			break

		상태_칸.textContent = 단계 + " 실패 (" + 시도 + " / " + 재시도_횟수 + ") 다시 시도합니다\n원인 : " + 마지막.원인
		await new Promise(resolve => setTimeout(resolve, 500))
	}

	return { ...마지막, 원인 : 마지막.원인 + " (" + 재시도_횟수 + "번 시도 후 실패)" }
}
// (추가) "종료"


///////////////////////////////////////////////////////////////////////////////////////////////////
// YouTube Player iframe API 준비 (명령.js 와 같은 구조)

const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
document.head.appendChild(api)

let api_준비_대기 = null
const api_준비 = new Promise(resolve => { api_준비_대기 = resolve })

let player = null

// cue 완료나 에러를 기다리는 곳에서 풀어줄 함수
let 상태_대기자 = null

function 대기_끝(내용)
{
	if (!상태_대기자)
		return

	const 끝 = 상태_대기자
	상태_대기자 = null
	끝(내용)
}

function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width : "100%",
		height : "100%",
		videoId : "",
		playerVars :
		{
			autoplay : 0,
			rel : 0,
			disablekb : 1,
		},
		events :
		{
			onReady : () =>
			{
				api_준비_대기()
				player.setVolume(0)
			},
			onError : event =>
			{
				대기_끝("플레이어 오류 코드 " + event.data)
			},
			onStateChange : event =>
			{
				if (event.data === YT.PlayerState.CUED)
					대기_끝("cued")
			},
		}
	})
}



///////////////////////////////////////////////////////////////////////////////////////////////////
// 기다리기 도구들

// 시작() 을 실행한 뒤 CUED 가 되거나 에러가 나거나 3초가 지날 때까지 기다린다
// 돌려주는 값 : "cued" 또는 실패 원인 문자열
function cued_대기(시작)
{
	const 대기 = new Promise(resolve => { 상태_대기자 = resolve })

	let 타이머 = null
	const 시간초과 = new Promise(resolve =>
	{
		타이머 = setTimeout(() => resolve("3초 안에 CUED 상태가 되지 않음"), 제한시간)
	})

	시작()

	return Promise.race([대기, 시간초과]).then(내용 =>
	{
		clearTimeout(타이머)
		상태_대기자 = null
		return 내용
	})
}

// player.getPlaylist() 가 값을 줄 때까지 0.1초마다 확인한다
// 돌려주는 값 : 배열(0개일 수도 있음) 또는 null(3초 동안 배열을 못 받음)
async function 재생목록_받기()
{
	const 끝 = Date.now() + 제한시간
	let 마지막 = null

	while (Date.now() < 끝)
	{
		const 목록 = player.getPlaylist?.()
		if (Array.isArray(목록))
		{
			마지막 = 목록
			if (목록.length > 0)
				return 목록
		}
		await new Promise(resolve => setTimeout(resolve, 100))
	}

	return 마지막
}



///////////////////////////////////////////////////////////////////////////////////////////////////
// 입력 문자열 가공

// 앞뒤 공백을 지우고 첫 번째 " 와 다음 " 사이의 문자열만 꺼낸다
// 따옴표가 없으면 trim 한 문자열을 그대로 돌려줌
function 문자열_정리(문자열)
{
	const 정리 = 문자열.trim()

	const 앞 = 정리.indexOf("\"")
	if (앞 === -1)
		return 정리

	const 뒤 = 정리.indexOf("\"", 앞 + 1)
	if (뒤 === -1)
		return 정리

	return 정리.slice(앞 + 1, 뒤).trim()
}

// "ㅁㅁㅁ", 구조이면 true
function 따옴표_쉼표_확인(문자열)
{
	const 정리 = 문자열.trim()

	const 앞 = 정리.indexOf("\"")
	if (앞 === -1)
		return false

	const 뒤 = 정리.indexOf("\"", 앞 + 1)
	if (뒤 === -1)
		return false

	return 정리[뒤 + 1] === ","
}

// 주소에서 재생목록 id (PL...) 추출, 못 찾으면 null
function 재생목록_id_찾기(주소)
{
	if (주소.startsWith("PL") && !주소.includes("/"))
		return 주소

	try
	{
		const url = new URL(주소)
		const 목록 = url.searchParams.get("list")
		return 목록 ? 목록 : null
	}
	catch
	{
		return null
	}
}



///////////////////////////////////////////////////////////////////////////////////////////////////
// 출력

function 결과_출력()
{
	if (!결과 || 결과.length === 0)
		return ""

	const 종류 = 종류_선택.value
	const 앞 = "\t\tid : "
	const 뒤 = 중괄호_생략 ? "," : ",\n\t},"
	const 여는_줄 = 중괄호_생략 ? "" : "\t{\n"

	const 출력_id = 결과.map(동영상 =>
	{
		const 순서_줄 = "\t\t// " + 동영상.순서 + "\n"
		const 제목_줄 = "\t\t// " + 동영상.제목 + "\n"
		const 주소 = "\"https://youtu.be/" + 동영상.id + "\""
		return 여는_줄 + 순서_줄 + 제목_줄 + 앞 + 주소 + 뒤
	}).join("\n")

	if (종류 === "")
		return 출력_id

	return "재생목록." + 종류 + " =\n[\n" + 출력_id
		+ "\n]"
}

function 버튼_갱신()
{
	document.getElementById("복사하기").disabled = 결과_칸.textContent === ""
}

function 실패_출력(단계, 원인)
{
	상태_칸.textContent = "실패 위치 : " + 단계 + "\n원인 : " + 원인
}



///////////////////////////////////////////////////////////////////////////////////////////////////
// 불러오기

async function 불러오기()
{
	const 불러오기_버튼 = document.getElementById("불러오기")
	불러오기_버튼.disabled = true
	결과 = []
	결과_칸.textContent = ""
	버튼_갱신()

	const 입력 = document.getElementById("주소_입력").value
	const 주소 = 문자열_정리(입력)
	중괄호_생략 = 따옴표_쉼표_확인(입력)

	try
	{
		// 1. api 호출 확인
		상태_칸.textContent = "api 호출 중"
		// (수정) "시작"
		// 기존에는 한 번 실패하면 바로 종료했지만, 재시도 함수로 감싸서 최대 3번 시도
		상태_칸.textContent = "api 호출 중"
		const api_결과 = await 재시도("api 호출", async () =>
		{
			const 응답 = await Promise.race(
			[
				api_준비.then(() => "ready"),
				new Promise(resolve => setTimeout(() => resolve("3초 안에 api 가 준비되지 않음"), 제한시간)),
			])

			if (응답 !== "ready")
				return { 성공 : false, 위치 : "api 호출", 원인 : 응답 }

			return { 성공 : true }
		})
		if (!api_결과.성공)
		{
			실패_출력(api_결과.위치, api_결과.원인 + " (인터넷 연결이나 차단 확장 프로그램 확인)")
			return
		}
		// (수정) "종료"

		// 2. 입력창 문자열에서 재생목록 id 찾기
		const 재생목록_호출 = 재생목록_id_찾기(주소)
		if (!재생목록_호출)
		{
			실패_출력("입력창 확인", "재생목록 주소(list=PL...)를 찾을 수 없음")
			return
		}

		// (수정) "시작"
		// 3번(cuePlaylist)과 4번(getPlaylist)을 하나로 묶어서, 어느 쪽이 실패해도 cuePlaylist 부터 다시 시도
		// 어디서 실패했는지는 실패 내용의 위치에 담아서 전달
		const 목록_응답 = await 재시도("재생목록 불러오기", async () =>
		{
			상태_칸.textContent = "재생목록 cue 중"
			const 목록_결과 = await cued_대기(() =>
			{
				player.cuePlaylist({ listType : "playlist", list : 재생목록_호출 })
			})
			if (목록_결과 !== "cued")
				return { 성공 : false, 위치 : "player.cuePlaylist", 원인 : 목록_결과 }

			const 받은_목록 = await 재생목록_받기()
			if (받은_목록 === null)
				return { 성공 : false, 위치 : "player.getPlaylist", 원인 : "3초 안에 배열을 받지 못함 (비공개 재생목록이거나 id 가 잘못됐을 수 있음)" }
			if (받은_목록.length === 0)
				return { 성공 : false, 위치 : "player.getPlaylist", 원인 : "배열은 받았지만 0개 (비어있는 재생목록이거나 비공개)" }

			return { 성공 : true, 값 : 받은_목록 }
		})
		if (!목록_응답.성공)
		{
			실패_출력(목록_응답.위치, 목록_응답.원인)
			return
		}

		const 동영상들_호출 = 목록_응답.값
		// (수정) "종료"

		// 5. 동영상마다 cueVideoById 후 제목 기억
		const 실패들 = []
		for (let 번호 = 0 ; 번호 < 동영상들_호출.length ; 번호++)
		{
			const id = 동영상들_호출[번호]
			const 순서 = 번호 + 1
			상태_칸.textContent = "제목 조사 중 " + 순서 + " / " + 동영상들_호출.length

			// (수정) "시작"
			// cueVideoById 와 제목 읽기를 하나로 묶어서, 어느 쪽이 실패해도 cueVideoById 부터 다시 시도
			const 동영상_응답 = await 재시도(순서 + "번 영상", async () =>
			{
				const 동영상_결과 = await cued_대기(() =>
				{
					player.cueVideoById({ videoId : id })
				})
				if (동영상_결과 !== "cued")
					return { 성공 : false, 위치 : "player.cueVideoById", 원인 : 동영상_결과 }

				const 제목 = player.getVideoData?.()?.title
				if (!제목)
					return { 성공 : false, 위치 : "player.getVideoData", 원인 : "제목이 비어있음" }

				return { 성공 : true, 값 : 제목 }
			})

			// 3번 모두 실패하면 실패 목록에 기록하고 다음 영상으로 넘어감
			if (!동영상_응답.성공)
			{
				실패들.push(순서 + "번 " + id + " : " + 동영상_응답.위치 + " 실패, " + 동영상_응답.원인)
				continue
			}

			결과.push({ 순서 : 순서, id : id, 제목 : 동영상_응답.값 })
			// (수정) "종료"

			// 하나 끝날 때마다 바로 보여줌
			결과_칸.textContent = 결과_출력()
		}

		let 마무리 = "불러온 영상 " + 결과.length + " / " + 동영상들_호출.length + "개"
		if (실패들.length > 0)
			마무리 += "\n실패 " + 실패들.length + "개\n" + 실패들.join("\n")
		상태_칸.textContent = 마무리
	}
	finally
	{
		결과_칸.textContent = 결과_출력()
		불러오기_버튼.disabled = false
		버튼_갱신()
	}
}

document.getElementById("불러오기").addEventListener("click", 불러오기)



///////////////////////////////////////////////////////////////////////////////////////////////////
// 복사하기, 초기화, 종류 변경

document.getElementById("복사하기").addEventListener("click", async () =>
{
	await navigator.clipboard.writeText(결과_칸.textContent)
	상태_칸.textContent = "복사됨"
})

document.getElementById("초기화").addEventListener("click", () =>
{
	location.reload()
})

// 종류를 바꾸면 다시 불러오지 않고 출력값만 변환
종류_선택.addEventListener("change", () =>
{
	if (!결과 || 결과.length === 0)
		return

	결과_칸.textContent = 결과_출력()
	버튼_갱신()
})

버튼_갱신()
// (추가) "종료"