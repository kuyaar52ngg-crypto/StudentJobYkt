Bug Reports: StudentJobYkt
BUG-01: Applications Sync Issue (Critical)
ID: BUG-01 Priority: Blocker / High Steps to Reproduce:

Log in as Candidate (tumat206@gmail.com).
Search for a vacancy (e.g., "IOS").
Click "Откликнуться" (Apply).
Navigate to "Личный кабинет" -> "Мои отклики".
Observe that the recently applied vacancy is missing from the list.
Navigate back to the vacancy page; the button correctly says "✓ Вы уже откликнулись".
Expected Result: The new application should appear in the "Мои отклики" list immediately. Actual Result: The application is missing from the dashboard despite the vacancy state being updated. Context: Console shows 401 Unauthorized for /api/auth/me on certain pages, potentially related to auth state sync.

BUG-03: Employer UI Inconsistency (Applicants Count)
ID: BUG-03 Priority: Medium (UX) Steps to Reproduce:

Log in as Employer (kuyaar52ngg@gmail.com).
Go to "Мои вакансии".
Find a vacancy with applicants (e.g., "0 откликов").
Expected Result: The number of applicants should be a clickable link leading to the "Мои отклики" tab, filtered by that vacancy. Actual Result: It is plain text. The user has to manually switch tabs and find the candidates.

BUG-04: Currency Symbol Input Failure (Technical)
ID: BUG-04 Priority: Low Steps to Reproduce:

Go to "Добавить вакансию".
Try to type "₽" or other special currency symbols in the salary field.
Expected Result: Symbol should be accepted or handled gracefully. Actual Result: Keyboard emulation failed for "₽". (Note: This might be an automation-specific issue, but worth checking manual input behavior).

Исправь все баги которые ты нашел.

Для админ панели исправь баг с отображением вакансий, они должны отображаться в виде карточек, а не списка. И также исправь удаление вакансий.

Для ЛК сделай так чтобы отображались личная инфорформация и рядом с ним кнопка редактирования, при нажатии на которую открывается форма с личной информацией и возможностью редактирования. Еще галочка верифицировано для ЛК работодателя должна быть видна.

Когда ты нажимаешь на кнопку откликнуться, то сразу появляется в ЛК в разделе мои отклики.

При регистрации и входе сразу отправляй пользователя в главный экран https://studentjobykt.vercel.app/

Исправь баг когда ты вводишь логин и пароль, но ты ошибся в пароле, кнопка войти не нажимается, исправляется когда ты обновляешь страницу. Еще сделай возможность увидеть пароль при вводе сделай иконку глаза, при нажатии на которую будет видно пароль, а при повторном нажатии скрывать пароль.

Исправь баг когда ты нажимаешь на избранные вакансии, обновляешь страницу, то избранные вакансии пропадают. Но в ЛК в разделе избранные вакансии они отображаются.

В админке сделай отдельную страницу для компаний, чтобы можно было видеть компании и управлять ими и еще забанить, разбанить, возможность убрать галочку верифицировано и добавить галочку верифицировано. В разделе модерация вакансий убери верификацию, так как она есть в разделе компаний.

Для раздела Мои отклики в ЛК работодателя сделай подробную информацию о кандидате, чтобы можно было видеть личную информацию и возможность дать ответ кандидату. Там же должна быть кнопка для перехода в почту кандидата. 

В каталоге вакансий сделай так чтобы при нажатии откликнуться, то сразу появляется в ЛК в разделе мои отклики. А не так как сейчас, когда ты нажимаешь откликнуться, то появляется  окно.

Еще когда ты входишь через мобильный телефон, то на хедере не отображается кнопка войти, сделай так чтобы она отображалась. 