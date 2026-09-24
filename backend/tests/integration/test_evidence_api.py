def test_submit_evidence_valid_request_returns_evaluation(client):
    response = client.post(
        "/evidence",
        json={
            "skillId": "pd-testing",
            "description": "Wrote pytest fixtures and mocking for a small project",
            "links": ["https://github.com/example/repo"],
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert set(body.keys()) == {"submissionId", "findings", "evaluatedAt"}
    findings = body["findings"]
    assert set(findings.keys()) == {
        "summary",
        "relevantSkillIds",
        "matchedCriteria",
        "missingCriteria",
        "confidence",
    }
    assert findings["confidence"] in {"low", "medium", "high"}
    assert "pd-testing" in findings["relevantSkillIds"]
    # Hard rule: no pass/fail field anywhere in the response.
    assert "pass" not in findings
    assert "failed" not in findings


def test_submit_evidence_unknown_skill_returns_404(client):
    response = client.post(
        "/evidence",
        json={"skillId": "not-a-real-skill", "description": "did some stuff", "links": []},
    )
    assert response.status_code == 404


def test_submit_evidence_missing_fields_returns_422(client):
    response = client.post("/evidence", json={"skillId": "pd-testing"})
    assert response.status_code == 422


def test_submit_evidence_empty_description_returns_422(client):
    response = client.post(
        "/evidence", json={"skillId": "pd-testing", "description": "", "links": []}
    )
    assert response.status_code == 422


def test_submit_evidence_marks_progress_component_complete(client):
    role_id = "python-developer"
    skill_id = "pd-databases"

    before = client.get(f"/roles/{role_id}/progress").json()
    before_breakdown = next(
        sp["breakdown"] for sp in before["skillProgress"] if sp["skillId"] == skill_id
    )
    assert before_breakdown["evidenceSubmitted"] == 0

    response = client.post(
        "/evidence",
        json={
            "skillId": skill_id,
            "description": "Modeled a small DynamoDB-style access pattern",
            "links": [],
        },
    )
    assert response.status_code == 201

    after = client.get(f"/roles/{role_id}/progress").json()
    after_breakdown = next(
        sp["breakdown"] for sp in after["skillProgress"] if sp["skillId"] == skill_id
    )
    assert after_breakdown["evidenceSubmitted"] == 20
