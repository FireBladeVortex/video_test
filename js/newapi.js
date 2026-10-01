
/*

https://developers.google.com/youtube/iframe_api_reference?hl=ko

https://gist.github.com/Araxeus/fc574d0f31ba71d62215c0873a7b048e

http://developer.mozilla.org/

https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events

https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values

*/



// YouTube Player iframe API 불러오기
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// document.head.appendChild(api)



// iframe 들어갈 변수 준비
let player = null

let player_ready_resolve = null // (추가)
const player_ready = new Promise(resolve => { player_ready_resolve = resolve }) // (추가) player 준비 완료 시점을 외부에서 기다리기 위함

// api 스크립트 삽입 + player 준비될 때까지 대기 (추가)
function load_player()
{
	document.head.appendChild(api)
	return player_ready
}

// iframe 호출
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width: "100%",
		height: "100%",
		videoId: "",
		playerVars:
		{
			autoplay: 0, // 자동재생 방지
			rel: 0, // 영상 종료 때 추천 방지
			// fs: 0, // 풀 스크린 버튼 숨김
			disablekb: 1, // 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			// controls: 0, // 유튜브 일부 ui 숨김
			origin: window.location.origin,
			cc_lang_pref: "ko",
			cc_load_policy: 1,
		},
		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				player.setVolume(+볼륨_조절.value) // 현재 value 적용
				player_ready_resolve() // (추가) player 사용 가능해진 시점 알림
			},
			onStateChange : onPlayerStateChange
		}
	})
}



/*
영상 상태 확인
YT.PlayerState.ENDED = 0
YT.PlayerState.PLAYING = 1
YT.PlayerState.PAUSED = 2
YT.PlayerState.BUFFERING = 3
YT.PlayerState.CUED = 5
*/
const 재생 = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const pause = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
const 재생중 = () => 재생() || 일시중지() // !재생중 === !play && !pause

// 최초 재생 시작하기 전 상태
let img_click = null
// 정보 관리
let set_id = null
let set_name = null
let set_title = null
let set_ch = null
// 시간 관리
let sec_start = null
let sec_end = null
// 시간 메세지
let msg_start = null
let msg_end = null

let video_multiple = 1
let short_multiple = 1

let active_data = { video: null, 쇼츠: null } // 현재 표시중인 목록 데이터
let list_ori = [] // original 값을 가진 데이터만 모음
let list_non = [] // original 값이 없는 데이터만 모음
let pli_ori = null // (추가) 재생목록에서 받아온 원곡 목록 저장
let pli_non = null // (추가) 재생목록에서 받아온 커버(video) 목록 저장
let pli_short = null // (추가) 재생목록에서 받아온 쇼츠 목록 저장
let pli_intro = null

// id 값이 실제로 채워진 배열인지 확인 (추가)
function valid_playlist(arr)
{
	return Array.isArray(arr) && arr.some(video => video.id)
}


function make_list()
{
	const 왼쪽 = document.getElementById("왼쪽")



	const has_ori = valid_playlist(temp_list.ori)
	const has_video = valid_playlist(temp_list.video)

	list_ori = has_ori ? temp_list.ori : []
	list_non = has_video ? temp_list.video : []

	const video_data = // (추가) 존재 조합에 따른 기본 표시 데이터 결정
		has_ori && has_video ? list_ori.concat(list_non) :
		has_ori ? list_ori :
		has_video ? list_non :
		null

	const video_type =
	[
		{ type: "video", tag: "동영상", data: video_data ?? null }, // 수정
		{ type: "쇼츠", tag: "쇼츠", data: temp_list.쇼츠 ?? null }, // 수정
		{ type: "long", tag: "부분 재생", data: temp_list.part ?? null }, // 수정
	]




	video_type.forEach(type =>
	{
		if (!type.data)
			return

		const 구역 = document.createElement("div")
		구역.className = "구역"
		구역.dataset.type = type.type
		왼쪽.appendChild(구역)

		const h1 = document.createElement("h1")
		구역.appendChild(h1)

		const 구역_재생목록 = document.createElement("div")
		구역_재생목록.className = "구역_재생목록"
		구역_재생목록.textContent = type.tag + " 재생 목록"
		h1.appendChild(구역_재생목록)


		const h1_종류 = document.createElement("div")
		h1_종류.className = "h1_종류"
		h1.appendChild(h1_종류)



			const h1_페이지 = document.createElement("div")
			h1_페이지.className = "h1_페이지"
			h1.appendChild(h1_페이지)


		if (type.type !== "long")
		{
			active_data[type.type] = type.data


			if (type.type === "video")
			{
				if (has_ori && has_video) // (수정) 위에서 계산한 값 재사용
				{
					const h1_모두 = document.createElement("div")
					h1_모두.className = "h1_모두"
					h1_종류.appendChild(h1_모두)

						const 모두 = document.createElement("span")
						모두.className = "문자열_클릭"
						모두.textContent = "모두"
						h1_모두.appendChild(모두)
						모두.addEventListener("click", () => switch_video_data(list_ori.concat(list_non))) // (수정)

					const h1_원곡 = document.createElement("div")
					h1_원곡.className = "h1_원곡"
					h1_종류.appendChild(h1_원곡)

						const 원곡 = document.createElement("span")
						원곡.className = "문자열_클릭"
						원곡.textContent = "원곡"
						h1_원곡.appendChild(원곡)
						원곡.addEventListener("click", () => switch_video_data(list_ori))

					const h1_커버 = document.createElement("div")
					h1_커버.className = "h1_커버"
					h1_종류.appendChild(h1_커버)

						const 커버 = document.createElement("span")
						커버.className = "문자열_클릭"
						커버.textContent = "커버"
						h1_커버.appendChild(커버)
						커버.addEventListener("click", () => switch_video_data(list_non))
				}
			}


				const 버튼_이전 = document.createElement("div")
				버튼_이전.className = "버튼_이전"
				버튼_이전.dataset.type = type.type
				h1_페이지.appendChild(버튼_이전)

					const 버튼_이전_문자열 = document.createElement("span")
					버튼_이전_문자열.className = "문자열_클릭"
					버튼_이전.appendChild(버튼_이전_문자열)
					버튼_이전_문자열.addEventListener("click", () =>
					{
						if (type.type === "쇼츠")
							short_multiple = Math.max(1, short_multiple - 1)
						else
							video_multiple = Math.max(1, video_multiple - 1)
						render_nav(type.type)
						update_page(type.type)
					})

				const 버튼_지금 = document.createElement("div")
				버튼_지금.className = "버튼_지금"
				버튼_지금.dataset.type = type.type
				h1_페이지.appendChild(버튼_지금)

				const 버튼_다음 = document.createElement("div")
				버튼_다음.className = "버튼_다음"
				버튼_다음.dataset.type = type.type
				h1_페이지.appendChild(버튼_다음)

					const 버튼_다음_문자열 = document.createElement("span")
					버튼_다음_문자열.className = "문자열_클릭"
					버튼_다음.appendChild(버튼_다음_문자열)
					버튼_다음_문자열.addEventListener("click", () =>
					{
						const last = get_last(type.type)
						const multiple = type.type === "쇼츠" ? short_multiple : video_multiple
						if (multiple >= last)
							return
						if (type.type === "쇼츠")
							short_multiple = short_multiple + 1
						else
							video_multiple = video_multiple + 1
						render_nav(type.type)
						update_page(type.type)
					})
			render_nav(type.type)
		}

		const h1_크기 = document.createElement("div")
		h1_크기.className = "h1_크기"
		h1.appendChild(h1_크기)

			const 크기_조절 = document.createElement("span")
			크기_조절.className = "문자열_클릭"
			크기_조절.textContent = "크게"
			크기_조절.dataset.type = type.type
			h1_크기.appendChild(크기_조절)
			크기_조절.addEventListener("click", () => resize_section(type.type))

		if (type.type === "long")
		{
			make_long()
			return
		}





		const 목록 = document.createElement("div")
		목록.className = `목록 ${type.type}`
		구역.appendChild(목록)

		// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
		const 페이지 = document.createElement("div")
		페이지.className = `페이지 ${type.type}`
		목록.appendChild(페이지)


		fill_page(type.type)
	})
}


//
function calc_size(목록)
{
	const 설정 = getComputedStyle(document.documentElement)
	const 가로값 = parseInt(설정.getPropertyValue("--가로"))
	const 세로값 = parseInt(설정.getPropertyValue("--세로"))

	const 쇼츠 = 목록.target.classList.contains("쇼츠")

	const 쇼츠_가로 = 쇼츠 ? 세로값 : 가로값
	const 쇼츠_세로 = 쇼츠 ? 가로값 : 세로값

	const 너비 = 목록.contentBoxSize[0].inlineSize
	const 높이 = 목록.contentBoxSize[0].blockSize

	const 가로 = Math.floor(너비 / 쇼츠_가로)
	const 세로 = Math.floor(높이 / 쇼츠_세로)
	const 몇칸 = 가로 * 세로

	return 몇칸
}


// total_cell 값에 맞춰 썸네일 버튼을 (재)생성하는 함수
function fill_page(type_str)
{
	const 페이지 = document.querySelector(`.페이지.${type_str}`)
	if (!페이지)
		return

	const data = active_data[type_str] ?? list_data[type_str]
	if (!data)
		return

	const crrt_data_count = 페이지.children.length
	const nxxt_data_count = data.length

	// const next_count = total_cell[type_str] 새로 계산된 필요 개수

	for (let num = 0; data.length; num++)
	{
		const ready = data[num]
		if (!ready) break

		const 버튼 = document.createElement("button")
		버튼.className = "버튼"
		버튼.dataset.num = num
		버튼.dataset.type = type_str

		const img = document.createElement("img")
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = ready.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		페이지.appendChild(버튼)

		버튼.addEventListener("click", () =>
		{
			const target = (type_str + "_" + (num + "").padStart(3, "0"))
			if (img_click === target)
			{
				if (재생())
				{
					player.pauseVideo()
				}
				else if (일시중지())
				{
					player.playVideo()
				}
				else
					return
			}
			else
			{
				click_img(target)
				const 쇼츠 = type_str === "쇼츠"
				ready_data(ready.id, 쇼츠 ? 0 : ready.start, 쇼츠 ? 0 : ready.end)
			}
		})
	}
}


// 모두/원곡/커버 클릭 시 표시할 video 데이터 교체
function switch_video_data(next_data)
{
	active_data.video = next_data // 현재 데이터 갱신

	const 페이지 = document.querySelector(`.페이지.video`)
	if (페이지) 페이지.innerHTML = "" // 기존 썸네일 제거 후 재생성

	fill_page("video") // 새 데이터로 다시 채움

	video_multiple = 1 // 페이지 번호 초기화
	render_nav("video")
	update_page("video")
}

// multiple 값에 맞는 범위만 썸네일 표시/숨김
function update_page(type_str)
{
	const num = total_cell[type_str]
	if (!num)
		return

	const multiple = type_str === "쇼츠" ? short_multiple : video_multiple
	const min_num = (multiple - 1) * num
	const max_num = (multiple * num) - 1

	document.querySelectorAll(`.버튼[data-type="${type_str}"]`).forEach(버튼 =>
	{
		const idx = +버튼.dataset.num
		const show = idx >= min_num && idx <= max_num
		버튼.style.display = show ? "" : "none"
	})
}

// 크기 변경 시 multiple, 표시값 초기화
function reset_page(type_str)
{
	if (type_str === "쇼츠")
		short_multiple = 1
	else
		video_multiple = 1


	render_nav(type_str)
}

// 마지막 페이지 번호 계산 공통 함수
function get_last(type_str)
{
	const num = total_cell[type_str]
	const data = active_data[type_str] ?? list_data[type_str]
	return Math.ceil(data.length / num)
}

// 이전/중앙/다음 버튼 영역을 상태에 맞게 다시 그리는 공통 함수
function render_nav(type_str)
{
	const 버튼_이전 = document.querySelector(`.버튼_이전[data-type="${type_str}"]`)
	const 버튼_지금 = document.querySelector(`.버튼_지금[data-type="${type_str}"]`)
	const 버튼_다음 = document.querySelector(`.버튼_다음[data-type="${type_str}"]`)
	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return



	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")


	const last = get_last(type_str)

	if (last <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const multiple = type_str === "쇼츠" ? short_multiple : video_multiple

	버튼_이전_문자열.textContent = multiple === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = multiple >= last ? "" : "다음"

	const 이전_숫자 = document.createElement("div")
	이전_숫자.className = "이전_숫자"
	이전_숫자.dataset.type = type_str
	이전_숫자.textContent = multiple === 1 ? "" : multiple - 1
	버튼_지금.appendChild(이전_숫자)

	const 지금_숫자 = document.createElement("div")
	지금_숫자.className = "지금_숫자"
	지금_숫자.dataset.type = type_str
	지금_숫자.textContent = multiple
	버튼_지금.appendChild(지금_숫자)

	const 다음_숫자 = document.createElement("div")
	다음_숫자.className = "다음_숫자"
	다음_숫자.dataset.type = type_str
	다음_숫자.textContent = multiple + 1 > last ? "" : multiple + 1
	버튼_지금.appendChild(다음_숫자)
}



function click_img(target)
{
	// 활성화 버튼 강조 나머지 버튼 어둡게
	document.querySelectorAll(".버튼").forEach(버튼 =>
	{
		const compare = (버튼.dataset.type + "_" + (버튼.dataset.num + "").padStart(3, "0"))
		const click_img = compare === target
		버튼.classList.toggle("강조", click_img)
		버튼.classList.toggle("발기", !click_img)
	})
	// total_list에서 클릭한 썸네일 또 클릭할때 쓰는 장치
	img_click = target
}


let big_type = null // 현재 확대된 섹션 타입 저장
// (수정) 재생 목록 칸 확대/축소 전환 (토글 방식)
function resize_section(type_str)
{
	const 왼쪽 = document.getElementById("왼쪽")
	const rows = { video: "2fr", 쇼츠: "2fr", long: "1fr" }

	const next_big = big_type === type_str ? null : type_str // 같은 타입 재클릭 시 해제

	if (next_big)
	{
		rows.video = type_str === "video" ? "1fr" : "0fr"
		rows.쇼츠 = type_str === "쇼츠" ? "1fr" : "0fr"
		rows.long = type_str === "long" ? "1fr" : "0fr"
	}

	왼쪽.style.gridTemplateRows = `${rows.video} ${rows.쇼츠} ${rows.long}`

	big_type = next_big // 상태 갱신

	document.querySelectorAll(".h1_크기 .문자열_클릭").forEach(span => // 모든 토글 문자열 재설정
	{
		span.textContent = span.dataset.type === big_type ? "작게" : "크게"
	})
}


// youtube 정보 가져오기 cue 상태 되기전
function ready_data(id, start = 0, end = 0)
{
	// // 주소에서 id 추출
	// const url = new URL(id)
	// const id_찾기 = url.searchParams.get("v") ?? url.pathname.split("/").pop()
	const id_찾기 = id

	if (arguments.length === 1)
		return id_찾기

	// 클릭 시 id 저장
	set_id = id

	// // 주소에서 t값 추출 + 시작시간 비교후 결정
	// const get_start = parseInt(url.searchParams.get("t"))
	// const set_start = !Number.isNaN(get_start) ? get_start : start
	const start_t = 시간_표기법(start)
	sec_start = start_t[0]
	msg_start = start_t[1]

	// 종료 시간 결정(getDuration() 아님)
	const end_t = 시간_표기법(end)
	sec_end = end_t[0]
	msg_end = end_t[1]

	// 영상 불러오기
	player.cueVideoById(
	{
		videoId : id_찾기,
		startSeconds : sec_start, // 광고 때문에 sec_start 대신 임시로 0
		...(sec_end > 0 && {endSeconds : sec_end})
	})

}



function 시간_표기법(시간)
{
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
	else if (typeof 시간 === "string")
	{
		const 오타수정 = 시간.replace(/;/g, ":")
		const 재확인 = 오타수정.includes(":")
		if (재확인)
		{
			const 시분초 = 오타수정.split(":")
			const 초 = +(시분초.pop())
			const 분 = 시분초.length ? +(시분초.pop()) : 0
			const 시 = 시분초.length ? +(시분초.pop()) : 0
			const 시간_숫자 = 시 * 3600 + 분 * 60 + 초
			const 시간_문자 = 시분초_표준([시, 분, 초])
			return [ 시간_숫자, 시간_문자 ]
		}
	}
	else
	{
		return [ 0, 0 ]
	}
}



// 시간 메세지 표기법 정리 24:00:00
function 시분초_표준(시분초)
{
	const 시간_길이 = 시분초.findIndex(값 => 값 !== 0)
	const 시간_길이_확인 = 시간_길이 === -1 ? 시분초.length - 1 : 시간_길이
	const 시간_정리 = 시분초.slice(시간_길이_확인)
	const 시간_변환 = 시간_정리.map((값, 순서) => 순서 === 0 ? (값 + "") : (값 + "").padStart(2,"0"))
	const 시분초 = 시간_변환.join(":")
	return 시분초
}



// 상태 변화 감지에서 사용할 재생 막대 변수
let 재생_시간_표시줄 = null

// 재생 막대
function ctrl_view()
{
	const cur = player.getCurrentTime()
	const ratio = (cur - sec_start) / (sec_end - sec_start)
	document.getElementById("재생_시간_지금").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	/*
	const [, msg_cur] = 시간_표기법(cur)
	if (msg_end && msg_start)
	{
		if (sec_start === 0)
		{
			document.getElementById("플레이어_메세지").textContent = `${msg_cur} < ${msg_end}`
		}
		else
		{
			document.getElementById("플레이어_메세지").textContent = `${msg_start} < ${msg_cur} > ${msg_end}`
		}
	}
	*/

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function get_songs(video) // valid_list 생성 대신 video 하나당 유효한 song 목록을 즉석에서 반환
{
	const song_list = video.song ?? []

	if (song_list.length === 0)
		return [{ id: video.id }] // id만 가진 경우 유효

	return song_list
		.filter(song => song.lang && song.name && song.title && song.start && song.end) // 모두 가진 것만 유효
		.map(song => ({ id: video.id, ...song }))
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// long 섹션 필터 드롭다운 생성 (수정/추가)
function make_long()
{
	if (!playlist.part)
		return // long 파일 없으면 작동 안함

	const 구역 = document.querySelector('.구역[data-type="long"]')
	if (!구역)
		return

	// 1행 (3칸, 1:3:1)
	const row1 = document.createElement("div")
	row1.className = "long_row1"
	구역.appendChild(row1)

	const lang_select = document.createElement("select")
	lang_select.className = "long_lang"
	row1.appendChild(lang_select)

	const name_select = document.createElement("select")
	name_select.className = "long_name"
	row1.appendChild(name_select)

	const empty_col = document.createElement("div")
	empty_col.className = "long_empty"
	row1.appendChild(empty_col)

	const ready_btn = document.createElement("button")
	ready_btn.className = "long_ready"
	ready_btn.textContent = "재생 준비"
	empty_col.appendChild(ready_btn)
	ready_btn.classList.add("발기")


	// 2행 (1칸, 100%)
	const row2 = document.createElement("div")
	row2.className = "long_row2"
	구역.appendChild(row2)

	const title_select = document.createElement("select")
	title_select.className = "long_title"
	row2.appendChild(title_select)

	// option 생성 도우미
	function make_option(select, value, text, selected = false)
	{
		const option = document.createElement("option")
		option.value = value
		option.textContent = text
		if (selected)
			{
				option.selected = true

		option.disabled = true
		option.hidden = true
			}
		select.appendChild(option)
	}

	make_option(lang_select, "", "언어", true)
	;["한국어", "영어", "일본어", "외국어", "개사"].forEach(lang => make_option(lang_select, lang, lang))

	make_option(name_select, "", "부른 이", true)
	make_option(title_select, "", "제목", true)

	// lang 값에 맞는 name 목록 갱신
	function update_name()
	{
		const lang_value = lang_select.value
		const names = new Set()

		playlist.part.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang)
					return // id만 가진 항목은 lang이 없으므로 제외
				if (!lang_value || song.lang.includes(lang_value)) // (수정) === → includes
				{
					names.add(song.name)
				}
			})
		})

		name_select.innerHTML = ""
		make_option(name_select, "", "부른 이", true)
		;[...names].forEach(name => make_option(name_select, name, name))
	}

	// lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
	function update_title()
	{
		const lang_value = lang_select.value
		const name_value = name_select.value

		title_select.innerHTML = ""
		make_option(title_select, "", "제목", true)

		if (!name_value)
			return // name 기본값이면 목록 비움

		const titles = new Set()

		playlist.part.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang)
					return // id만 가진 항목은 제외
				const lang_match = !lang_value || song.lang.includes(lang_value) // (수정) === → includes
				const name_match = song.name === name_value
				if (lang_match && name_match)
				{
					titles.add(song.title)
				}
			})
		})


		;[...titles].forEach(title => make_option(title_select, title, title))
		ready_btn.classList.toggle("강조", false)
	}

	lang_select.addEventListener("change", () =>
	{
		update_name()
		update_title()
	})
	name_select.addEventListener("change", update_title)

	title_select.addEventListener("change", () =>
	{
		ready_btn.classList.toggle("강조", title_select.value)
		ready_btn.classList.toggle("발기", !title_select.value)
	})

	ready_btn.addEventListener("click", () =>
	{
		const target = "long_ready"
		{
			click_img(target)
			const lang_value = lang_select.value
			const name_value = name_select.value
			const title_value = title_select.value

			let song = null
			for (const video of playlist.part) // valid_list 대신 list_data.long 직접 순회
			{
				const found = get_songs(video).find(s =>
					s.lang && // id만 가진 항목은 제외
					(!lang_value || s.lang.includes(lang_value)) &&
					s.name === name_value &&
					s.title === title_value
				)
				if (found)
				{
					song = found
					break
				}
			}

			if (song)
			{
				ready_data(song.id, song.start, song.end) // video.id 대신 song.id (valid_list에 이미 포함됨)
			}
		}
	})

	update_name()
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 이름 제목
async function fetch_oembed(id) // 값 실적용 대신 뱉어내는 방식으로 변경
{
	// const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
	const 주소_1 = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
	const 주소_2 = id
	const 주소_3 = "&format=json"
	const 주소 = 주소_1 + 주소_2 + 주소_3
	try
	{
		const input = await fetch(주소)
		const data = await input.json()

		set_name = data.author_name
		set_ch = data.author_url
		set_title = data.title
		document.title = set_name

		if (arguments.length !== 1)
			return

		document.getElementById("플레이어_메세지").style.textAlign = "start"
		document.getElementById("플레이어_메세지").textContent = set_title
	}
	catch
	{
	}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


const 볼륨 = document.getElementById("볼륨")
const 볼륨_조절 = document.getElementById("볼륨_조절")




// 볼륨 조절 막대 값 반영 시키기
볼륨_조절.addEventListener("input", () =>
{
	player.setVolume(+볼륨_조절.value)
})



// 소리 크기 조절하는데 간섭 방지
const 방지 = 간섭 => 간섭.stopPropagation()
볼륨.addEventListener("mousedown", 방지)
볼륨.addEventListener("click", 방지)




// 해당하는 키 입력 기본 작동을 무시
// 스페이스 바가 재생_일시중지_조작()를 실행
// 숫자 패드 컨트롤 또는 쉬프트 +-로 재생 속도 조절 (보류)
// 숫자 패드 +-로 소리 크기 조절
document.addEventListener("keydown", 키 =>
{
	const 증가 = 키.code === "NumpadAdd" || 키.code === "ArrowUp"
	const 감소 = 키.code === "NumpadSubtract" || 키.code === "ArrowDown"
	// const 컨트롤_쉬프트 = 키.ctrlKey || 키.shiftKey
	/*
	if (!컨트롤_쉬프트)
	{
	*/
		if (증가)
		{
			키.preventDefault()
			소리_크기_조절(+5)
		}
		else if (감소)
		{
			키.preventDefault()
			소리_크기_조절(-5)
		}
	/*
	}
	else if (컨트롤_쉬프트 && 증가 || 감소)
	{
		키.preventDefault()
	}
	*/
	// 준비안됐으면 작동 중지
	if (!player || !재생중()) return

	if (!키.repeat)
	{
		if (키.code === "Space")
		{
			키.preventDefault()
			재생_일시중지_조작()
		}
		if (키.code === "ArrowLeft")
		{
			키.preventDefault()
			player.seekTo(Math.max(sec_start, player.getCurrentTime() - 5), true) // sec_start 보다 작아질 수 없음
		}
		if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(sec_end, player.getCurrentTime() + 5), true) // sec_end 보다 커질 수 없음
		}
		// 현재 재생 위치 변경
		if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = sec_start + Math.floor((sec_end - sec_start) * 비율)
			player.seekTo(숫자키, true)
		}

		/*
		else if (컨트롤_쉬프트 && 증가 || 감소)
		{
			key.preventDefault()
			const updown = 증가 ? 0.05 : -0.05
			const limit = 증가 ? 2 : 0.25
			const minmax  = 증가 ? Math.min : Math.max
			player.setPlaybackRate(minmax(limit, (player.getPlaybackRate() + updown)))
		}
		else if (key.code === "Numpad0")
		{
			key.preventDefault()
			player.setPlaybackRate(1)
		}
		*/

	}
})



// 마우스 휠 소리 크기 조절 및 오작동 억제
document.addEventListener("wheel", wheel =>
{
	wheel.preventDefault()
	소리_크기_조절(wheel.deltaY < 0 ? +5 : -5)
},
{
	passive: false
})



function 소리_크기_조절(증감)
{
	const 지금소리크기 = player.getVolume()
	const 올려내려 = 증감 > 0
		? Math.floor(지금소리크기 / 5) * 5 + 5
		: Math.ceil(지금소리크기 / 5) * 5 - 5
	const 범위 = Math.min(100, Math.max(0, 올려내려))
	player.setVolume(범위)
	볼륨_조절.value = 범위
}



function 재생_속도_조절(키, 증감)
{
}



// 재생 일시중지
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




// 영상 상태 확인
// YT.PlayerState.ENDED = 0
// YT.PlayerState.PLAYING = 1
// YT.PlayerState.PAUSED = 2
// YT.PlayerState.BUFFERING = 3
// YT.PlayerState.CUED = 5

// 동영상 상태가 변화하면 즉시 작동
function onPlayerStateChange(event)
{
	// 영상 정보 불러온 상태(재생 시작 전)
	if (event.data === 5)
	{
		if (playlist_ready_resolve) // (추가) 대기 중인 큐잉이 있으면 완료 알림
		{
			playlist_ready_resolve()
			playlist_ready_resolve = null
		}
		player.setPlaybackRate(1)
		if (sec_end === 0)
		{
			[sec_end, msg_end] = 시간_표기법(player.getDuration())
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
			document.getElementById("플레이어_메세지").style.textAlign = "start"
			document.getElementById("플레이어_메세지").textContent = title
			fetch_oembed(set_id, title)
		}
		else
		{
			fetch_oembed(set_id)
		}
	}
	// 재생 중일 때 100ms마다 진행바 갱신
	if (event.data === 1)
	{
		if (player.getCurrentTime() < sec_start)
		{
			player.seekTo(sec_start, true)
		}
		clearInterval(재생_시간_표시줄) // 인터벌 중복 호출 방지
		재생_시간_표시줄 = setInterval(ctrl_view, 100)
	}
	else
	{
		clearInterval(재생_시간_표시줄)
	}
	// 영상 재시작
	if (event.data === 0)
	{
		player.seekTo(sec_start, true)
		player.playVideo()
	}
	//
	const pop = [1, 2, 3].includes(event.data)
	// ("#오른쪽, #클릭_방지") // #클릭_방지 임시 삭제 사용자 선택으로 버튼 만들기 전까지
	document.querySelectorAll("#오른쪽").forEach(overlay =>
	{
		overlay.style.cursor = pop ? "pointer" : "default"
		overlay.onclick = pop ? play_or_pause : null
	})
	// document.getElementById("클릭_방지").style.pointerEvents = pop ? "auto" : "none"
}

// 싲가
const total_cell = { video: 0, 쇼츠: 0 }

const resize = new ResizeObserver(entry =>
{
	entry.forEach(목록 =>
	{
		const type = 목록.target.classList.contains("쇼츠") ? "쇼츠" : "video"
		total_cell[type] = calc_size(목록)

		reset_page(type)
		update_page(type)
	})
})

// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{
	// document.head.appendChild(api) // YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".목록").forEach(목록 => resize.observe(목록)) // 크기 관찰 시작

	// this.remove() // 스위치 사각형 제거
}

// document.getElementById("switch").addEventListener("click", switch_click)




// 유효한 유튜브 영상 id 확인 (수정) 재생목록 처리 분리, 동기 함수로 원복
function id_찾기(id)
{
	try
	{
		const url = new URL(id)
		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const vid = v ?? path

		const regex = /^[a-zA-Z0-9_-]{11}$/
		if (!regex.test(vid))
			return null

		const t = parseInt(url.searchParams.get("t"))
		return (Number.isNaN(t)) ? vid : [vid, t]
	}
	catch
	{
		return null
	}
}


// CUED(5) 상태 감지용 대기 장치 (추가)
let playlist_ready_resolve = null

// 큐잉 완료(CUED)까지 대기 (추가)
function wait_cued()
{
	return new Promise(resolve => { playlist_ready_resolve = resolve })
}

// // 재생목록 id마다 독립된 임시 player로 동시 큐잉 + 결과를 pli_* 전역 변수에 저장 (수정)
// function cue_and_wait(list_id, key)
// {
// 	const temp_div = document.createElement("div") // (수정) Promise 밖으로 이동
// 	document.body.appendChild(temp_div) // (수정)

// 	let temp_player = null // (추가) 콜백 내부에서 참조할 수 있도록 미리 선언

// 	const promise = new Promise(resolve => // (수정) Promise를 변수에 먼저 담음
// 	{
// 		temp_player = new YT.Player(temp_div, // (수정)
// 		{
// 			height: "0", width: "0",
// 			events:
// 			{
// 				onReady: () => // (추가) player가 실제로 준비된 뒤에만 메서드 호출 가능
// 				{
// 					temp_player.cuePlaylist({ listType: "playlist", list: list_id }) // (수정) 위치 이동: onReady 안에서 실행
// 				},
// 				onStateChange: event =>
// 				{
// 					if (event.data !== YT.PlayerState.CUED) return

// 					const list = temp_player.getPlaylist()
// 					if (!list || !list.length) return

// 					const result = list.map(id => ({ id }))

// 					if (key === "intro") pli_intro = result
// 					else if (key === "ori") pli_ori = result
// 					else if (key === "short") pli_short = result
// 					else pli_non = result

// 					temp_player.destroy()
// 					temp_div.remove()

// 					resolve() // 대입/정리 끝난 뒤 신호만 보냄
// 				}
// 			}
// 		})
// 	})

// 	// temp_player.cuePlaylist({ listType: "playlist", list: list_id }) // (수정) Promise 밖에서 큐잉 실행

// 	return promise // (수정) 마지막에 한 줄로 return
// }


function cue_and_wait(id)
{
	const temp_div = document.createElement("div")
	document.body.appendChild(temp_div)

	let temp_player = null // (추가) 콜백 내부에서 참조할 수 있도록 미리 선언

	const promise = new Promise(resolve => // (수정) Promise를 변수에 먼저 담음
	{
		temp_player = new YT.Player(temp_div,
		{
			height: "0", width: "0",
			events:
			{
				onReady: () => // (추가) player가 실제로 준비된 뒤에만 메서드 호출 가능
				{
					temp_player.cuePlaylist({ listType: "playlist", list: id })
					// (수정) 위치 이동: onReady 안에서 실행
				},
				onStateChange: event =>
				{
					if (event.data !== YT.PlayerState.CUED)
						return

					const 재생목록 = temp_player.getPlaylist()
					if (!재생목록)
						return

					const result = 재생목록.map(id => ({ id }))

					temp_player.destroy()
					temp_div.remove()

					resolve(result)
				}
			}
		})
	})
	return promise
}










// // intro 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
// async function cue_intro(intro)
// {
// 	const video = intro?.[0]
// 	if (!video) return

// 	const list_id = get_list_id(video.id)

// 	if (list_id)
// 	{
// 		player.setShuffle(true) // 랜덤 선택
// 		player.cuePlaylist({ listType: "playlist", list: list_id })
// 		await wait_cued()
// 		return
// 	}

// 	const fix = id_찾기(video.id)
// 	if (!fix) return

// 	ready_data(Array.isArray(fix) ? fix[0] : fix)
// }



// intro 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
function cue_intro(intro)
{
	if (playlist_or_video(intro))
	{
		player.setShuffle(true) // 랜덤 선택
		player.cuePlaylist(
		{
			listType: "playlist",
			list: intro
		})
	}
	else
	{
		player.cueVideoById(
		{
			videoId : intro,
		})
	}
}

