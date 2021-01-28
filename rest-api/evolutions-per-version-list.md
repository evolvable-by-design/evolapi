# List of evolutions per version

## v1.0.0

It includes:

- User creation, login, logout, details, change password
- Project: creation, list, update, delete, archive, unarchive, invite and detail
- Task: create, list, update, delete, detail, complete, moveToQa

No evolution here

## v2.0.0

- Change /project/{project}/invite URL to /project/{projectId}/addCollaborator -> Rename method (n°5)
- Rename tasks property 'name' into 'title' -> Rename parameter (n°6) & Rename API elements (n°14)

## v3.0.0

- Remove website from User -> Remove API elements (n°27)
- Add creationDate to tasks -> Add API elements (n°21)

## v4.0.0

- for tasks, rename projectId into parentProjectId -> Rename API elements (n°14)
- adds tags and priority properties to tasks -> Add API elements (n°21) & Add parameter (n°1)
- replace createAfter with createdBefore as tasks query parameters -> Remove parameter (n°1) and Add parameter (n°1)

## v5.0.0

- change verb POST to PUT for archive and unarchive projects to respect HTTP semantics -> Change Request Method (n°22) x2

## v5.1.0

- update task creation data validation constraints -> Change Parameter's Schema Constraints (n°19)

## v6.0.0

- Remove analyics related information from all resources and moves them to a new Analytics resource -> Move API elements (n°13)
- Adds operation to star a project -> Add operation (n°20) (moving from v6.0.0 to any previous version would produce the change "Delete method (n°4))
- Replace technical ids with URLs to represent relationships -> Change format of parameter (n°7) & Change format of return value (n°8)

## v7.0.0

- Remove /project/{projectId} preceeding all /task routes and rename projectId into parentProjectId for tasks -> Rename Method (n°5) x6 & Rename parameter (n°6)

## 7.1.0

- Replace X-Next and X-Last headers with the standard Link header -> HTTP header change (n°17) x2

## v7.2.0

- Update error scheme -> Error condition change (n°18)

## v8.0.0

Projects can not be public anymore :

- it is required to log in to invoke GET /projects -> Restrict Access to API (n°12)
- The isPublic property of projects is removed -> Remove API elements (n°27)

## v8.0.1

- Default project page is now 5 elements long instead of 3 -> Change Parameter's Schema Constraints (n°19)

## v9.0.0

- Merge archive and unarchive project -> Combine methods (n°9) (and Split method (n°10) can be tested by changing from v9.0.0 to v8.0.1)
- Add archive operation to the tasks -> Add operation (n°20)

## v9.1.0

- Add X-Next and X-Last headers to the list of projects to help navigate the collection -> HTTP header change (n°17) x2
- Add an operation to list existing users -> Add operation (n°20)

## v9.2.0

- Only admin users can delete projects and tasks -> Precondition change (n°23)

## v10.0.0

- Description, assignee and status of tasks are moved to a 'details' object -> Change type of return value (n°3)
- Change type of inviteCollaborators input params to userId instead of uuid or email -> Change format of parameter (n°7)

## v10.0.1

- Bug fix: now checks that a task is archived before deleting it -> Behavior change (n°15)

## v10.1.0

- It is not required to archive a task before deleting it anymore -> The set of operations to execute to achieve a business process changed (n°25)

## v11.0.0

- The update task operation is now at `/task` instead of `/task/{taskId}` and the id should now be passed in the request body instead of the path -> Move parameters (n°26) & Rename method (n°5)
- The description, assignee and status fields of the update task operation are moved to a `details` object instead of being at the root of the object (n°2)

## v12.0.0

- Collaborators of a project are now identified from their username instead of resource url -> Change format of parameter (n°7) & Change format of return value (n°8)
- Assignee of tasks are now identified from their username instead of resource url ->  Change format of parameter (n°7) & Change format of return value (n°8)
- Update operation to search user from username instead of id -> Change type of parameter (n°7)
- Add `nextCreationStep`, `description`, `availableTaskStatuses` and `taskStatusTransitions` to the Project resource (these properties are read-only) -> Add API elements (n°21)
- The creation of a project now follows a 3-step process: (i) the creation is initiated with a title, (ii) the available task status are set, along with authorized transitions, (iii) the project information are input (description, collaborators) -> The set of operations to execute to achieve a business process changed (n°25) & Add operation (n°20)
- Replaces the `PUT /task/{id}/toQa` and `PUT task/{id}/complete` operations with a `PUT /task/{id}/status` operation -> Combine Methods (n°9)
- Remove parameter `status` of the `PUT /task` operation -> Add or remove parameter (n°1)
- Remove parameter `status` of the `POST /task/technicalStory` and `POST /task/userStory` operations -> Add or remove parameter (n°1) x2
- All the operations on a project now require it to be completely setup (4 operations are concerned: delete, star, add collaborator and archive) -> Precondition change (n°23) x4

```typescript
// from and to are strings formatted as comma delimited list of statusId, ex: 'todo, in-progress, done'. The '*' value can be used to select all statuses
type taskStatusTransitions = Array<{
  from: string
  to: string
}>
```

## v13.0.0

- The process to create a project changed. Indeed, step 2 and 3 are interchanged, the information of the process must now be input before selecting the available tasks status transitions -> The order in which a set of operations must be played to achieve a business process changed (n°24)

## v14.0.0

- The list of projects is now returned as an XML instead of a JSON -> Change Media-Type of Return Value (n°11)

## v15.0.0

- When a project is completely created, the value of `nextCreationStep` is now `null` instead of `CREATION_COMPLETED` -> Post condition change (n°16)

### Occurences per type of change

1. 6
2. 1
3. 1
4. 1 (going from v6 to any previous version)
5. 8
6. 2
7. 5
8. 3
9. 2
10. 1 (from v9.0.0 to v8.0.1)
11. 1
12. 1
13. 1
14. 2
15. 1
16. 1
17. 4
18. 1
19. 2
20. 4
21. 3
22. 2
23. 5
24. 1
25. 2
26. 1
27. 2
