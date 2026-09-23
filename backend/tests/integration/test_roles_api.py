EXPECTED_ROLE_IDS = {"cloud-engineer", "devops-engineer", "python-developer"}


def test_list_roles_returns_exactly_three_curated_roles(client):
    response = client.get("/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) == 3
    assert {role["id"] for role in roles} == EXPECTED_ROLE_IDS


def test_list_roles_matches_frontend_field_contract(client):
    response = client.get("/roles")
    role = response.json()[0]
    assert set(role.keys()) == {"id", "name", "description", "skills", "suggestedProjects"}
    skill = role["skills"][0]
    assert set(skill.keys()) == {
        "id",
        "name",
        "category",
        "description",
        "importance",
        "difficulty",
        "prerequisites",
        "learningResource",
    }
    learning_resource = skill["learningResource"]
    assert set(learning_resource.keys()) == {
        "skillId",
        "videoTitle",
        "youtubeUrl",
        "note",
        "curatedBy",
    }


def test_get_role_valid_id_returns_role(client):
    response = client.get("/roles/cloud-engineer")
    assert response.status_code == 200
    role = response.json()
    assert role["id"] == "cloud-engineer"
    assert role["name"] == "Cloud Engineer"
    assert any(skill["id"] == "ce-networking-fundamentals" for skill in role["skills"])


def test_get_role_unknown_id_returns_404(client):
    response = client.get("/roles/not-a-real-role")
    assert response.status_code == 404


def test_get_progress_valid_role_returns_full_breakdown(client):
    response = client.get("/roles/python-developer/progress")
    assert response.status_code == 200
    body = response.json()
    assert body["roleId"] == "python-developer"
    assert isinstance(body["overallPercentage"], int)
    assert len(body["skillProgress"]) == 7
    first_skill = body["skillProgress"][0]
    assert set(first_skill.keys()) == {"skillId", "breakdown", "totalPercentage"}
    assert set(first_skill["breakdown"].keys()) == {
        "selfAssessment",
        "objectiveQuiz",
        "practicalProject",
        "evidenceSubmitted",
    }


def test_get_progress_unknown_role_returns_404(client):
    response = client.get("/roles/not-a-real-role/progress")
    assert response.status_code == 404


def test_get_progress_breakdown_values_are_valid_weights(client):
    response = client.get("/roles/cloud-engineer/progress")
    body = response.json()
    for skill_progress in body["skillProgress"]:
        breakdown = skill_progress["breakdown"]
        assert breakdown["selfAssessment"] in (0, 20)
        assert breakdown["objectiveQuiz"] in (0, 30)
        assert breakdown["practicalProject"] in (0, 30)
        assert breakdown["evidenceSubmitted"] in (0, 20)
        assert skill_progress["totalPercentage"] == sum(breakdown.values())
