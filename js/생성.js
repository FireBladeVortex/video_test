


function get_songs(video) // valid_list 생성 대신 video 하나당 유효한 song 목록을 즉석에서 반환
{
	const song_list = video.song ?? []

	if (song_list.length === 0)
		return [{ id: video.id }] // id만 가진 경우 유효

	const asdasd = song_list
		.filter(song => song.lang && song.name && song.title && song.start && song.end) // 모두 가진 것만 유효
		.map(song => ({ id: video.id, ...song }))
	return asdasd
}




// long 섹션 필터 드롭다운 생성 (수정/추가)
function make_long()
{
	if (!임시_목록.부분)
		return // long 파일 없으면 작동 안함

	const 구역 = document.querySelector(".구역[data-종류=부분]")
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

		임시_목록.부분.forEach(video => // valid_list 대신 임시_목록.long 직접 순회
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

		임시_목록.부분.forEach(video => // valid_list 대신 임시_목록.long 직접 순회
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
			이미지_클릭_강조(target)
			const lang_value = lang_select.value
			const name_value = name_select.value
			const title_value = title_select.value

			let song = null
			for (const video of 임시_목록.부분) // valid_list 대신 임시_목록.long 직접 순회
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









