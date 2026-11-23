---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''
type: Bug

---

name: 버그 제보
description: 오류를 제보합니다
title: "[버그] "
labels: ["bug"]
body:
  - type: textarea
    id: 증상
    attributes:
      label: 증상
      description: 어떤 문제가 생겼나요?
    validations:
      required: true
  - type: dropdown
    id: 브라우저
    attributes:
      label: 브라우저
      options:
        - Chrome
        - Edge
        - Firefox
