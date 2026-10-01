




















// total_cell 값에 맞춰 썸네일 버튼을 (재)생성하는 함수
function fill_page(type_str)
{
	const 페이지 = document.querySelector(".페이지." + type_str)
	// const 페이지 = document.querySelector(".페이지." + type_str)
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


// long 섹션 필터 드롭다운 생성 (수정/추가)
function make_long()
{
	if (!playlist.part)
		return // long 파일 없으면 작동 안함

	const 구역 = document.querySelector(".구역[data-종류=부분재생]")
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


// 이전/중앙/다음 버튼 영역을 상태에 맞게 다시 그리는 공통 함수
function render_nav(type_str)
{
	const 버튼_이전 = document.querySelector(".버튼_이전[data-종류=" + type_str + "]")
	const 버튼_지금 = document.querySelector(".버튼_지금[data-종류=" + type_str + "]")
	const 버튼_다음 = document.querySelector(".버튼_다음[data-종류=" + type_str + "]")
	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return



	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")


	const 페이지_수 = get_last(type_str)

	if (페이지_수 <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const multiple = type_str === "쇼츠" ? short_multiple : video_multiple

	버튼_이전_문자열.textContent = multiple === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = multiple >= 페이지_수 ? "" : "다음"

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
	다음_숫자.textContent = multiple + 1 > 페이지_수 ? "" : multiple + 1
	버튼_지금.appendChild(다음_숫자)
}




// id 값이 실제로 채워진 배열인지 확인 (추가)
function 유효_재확인(arr)
{
	return Array.isArray(arr) && arr.some(video => video.id)
}


function make_list()
{
	const 왼쪽 = document.getElementById("왼쪽")



	const has_ori = 유효_재확인(임시_목록.원곡)
	const has_video = 유효_재확인(임시_목록.커버)

	list_ori = has_ori ? 임시_목록.원곡 : []
	list_non = has_video ? 임시_목록.커버 : []

	const video_data = // (추가) 존재 조합에 따른 기본 표시 데이터 결정
		has_ori && has_video ? list_ori.concat(list_non) :
		has_ori ? list_ori :
		has_video ? list_non :
		null

	const 동영상_종류 =
	[
		{
			종류 : "동영상",
			tag: "동영상",
			data: video_data ?? null
		},
		{
			종류 : "쇼츠",
			tag: "쇼츠",
			data: 임시_목록.쇼츠 ?? null
		},
		{
			종류 : "부분재생",
			tag: "부분",
			data: 임시_목록.부분재생 ?? null
		},
	]


	동영상_종류.forEach(분류 =>
	{
		if (!분류.data)
			return

		const 구역 = document.createElement("div")
		구역.className = "구역"
		구역.dataset.종류 = 분류.종류
		왼쪽.appendChild(구역)

		const h1 = document.createElement("h1")
		구역.appendChild(h1)

		const 구역_재생목록 = document.createElement("div")
		구역_재생목록.className = "구역_재생목록"
		구역_재생목록.textContent = 분류.tag + " 재생 목록"
		h1.appendChild(구역_재생목록)


		const h1_종류 = document.createElement("div")
		h1_종류.className = "h1_종류"
		h1.appendChild(h1_종류)



			const h1_페이지 = document.createElement("div")
			h1_페이지.className = "h1_페이지"
			h1.appendChild(h1_페이지)


		if (분류.종류 !== "long")
		{
			active_data[분류.종류] = 분류.data


			if (분류.종류 === "video")
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
				버튼_이전.dataset.type = 분류.종류
				h1_페이지.appendChild(버튼_이전)

					const 버튼_이전_문자열 = document.createElement("span")
					버튼_이전_문자열.className = "문자열_클릭"
					버튼_이전.appendChild(버튼_이전_문자열)
					버튼_이전_문자열.addEventListener("click", () =>
					{
						if (분류.종류 === "쇼츠")
							short_multiple = Math.max(1, short_multiple - 1)
						else
							video_multiple = Math.max(1, video_multiple - 1)
						render_nav(분류.종류)
						update_page(분류.종류)
					})

				const 버튼_지금 = document.createElement("div")
				버튼_지금.className = "버튼_지금"
				버튼_지금.dataset.type = 분류.종류
				h1_페이지.appendChild(버튼_지금)

				const 버튼_다음 = document.createElement("div")
				버튼_다음.className = "버튼_다음"
				버튼_다음.dataset.type = 분류.종류
				h1_페이지.appendChild(버튼_다음)

					const 버튼_다음_문자열 = document.createElement("span")
					버튼_다음_문자열.className = "문자열_클릭"
					버튼_다음.appendChild(버튼_다음_문자열)
					버튼_다음_문자열.addEventListener("click", () =>
					{
						const last = get_last(분류.종류)
						const multiple = 분류.종류 === "쇼츠" ? short_multiple : video_multiple
						if (multiple >= last)
							return
						if (분류.종류 === "쇼츠")
							short_multiple = short_multiple + 1
						else
							video_multiple = video_multiple + 1
						render_nav(분류.종류)
						update_page(분류.종류)
					})
			render_nav(분류.종류)
		}

		const h1_크기 = document.createElement("div")
		h1_크기.className = "h1_크기"
		h1.appendChild(h1_크기)

			const 크기_조절 = document.createElement("span")
			크기_조절.className = "문자열_클릭"
			크기_조절.textContent = "크게"
			크기_조절.dataset.type = 분류.종류
			h1_크기.appendChild(크기_조절)
			크기_조절.addEventListener("click", () => resize_section(분류.종류))

		if (분류.종류 === "long")
		{
			make_long()
			return
		}


		const 목록 = document.createElement("div")
		목록.className = "목록" + 분류.종류
		구역.appendChild(목록)

		// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
		const 페이지 = document.createElement("div")
		페이지.className = "페이지" + 분류.종류
		목록.appendChild(페이지)


		fill_page(분류.종류)
	})
}


function 만들기_이름표들(이름_상자)
{
	const 이름표_목록 = document.createElement("div")
	이름표_목록.className = "이름표_목록"
	이름_상자.appendChild(이름표_목록)

	가나다순_정렬(이름_목록).forEach(누구 =>
	{
		const 이름표 = document.createElement("div")
		이름표.className = "이름표"

		이름표.textContent = 누구.중복 ? 누구.이름 + "*" : 누구.이름
		이름표_목록.appendChild(이름표)

		이름표.addEventListener("click", () =>
		{
			이름_상자.innerHTML = ""
			이름_상자.textContent = "불러오는 중"
			재생목록_불러오기(누구)
		})
	})
}



function 만들기_가나다(이름_상자)
{
	const h1 = document.createElement("h1")
	이름_상자.appendChild(h1)

	const 가나다 = document.createElement("div")
	가나다.className = "가나다"
	h1.appendChild(가나다)

	const 가나다순 =
	[
		"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
		"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
	]

	가나다순.forEach(가나다_순서대로 =>
	{
		const 자음_상자 = document.createElement("span")
		자음_상자.className = "자음_상자"
		자음_상자.textContent = 가나다_순서대로
		가나다.appendChild(자음_상자)

		const 자음_번호 = document.createElement("span")
		자음_번호.className = "자음_번호"
		가나다.appendChild(자음_번호)
	})
}

