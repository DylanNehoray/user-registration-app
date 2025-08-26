from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

def seed_database():
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if users already exist
    existing_user = db.query(models.User).first()
    if existing_user:
        print("Database already seeded!")
        return
    
    # Create 10 fake users with @getcovered.io emails
    users = [
        {
            "email": "john.doe@getcovered.io",
            "first_name": "John",
            "last_name": "Doe",
            "password": "Password123!"
        },
        {
            "email": "jane.smith@getcovered.io",
            "first_name": "Jane",
            "last_name": "Smith",
            "password": "SecurePass456#"
        },
        {
            "email": "mike.johnson@getcovered.io",
            "first_name": "Mike",
            "last_name": "Johnson",
            "password": "TestPass789$"
        },
        {
            "email": "sarah.williams@getcovered.io",
            "first_name": "Sarah",
            "last_name": "Williams",
            "password": "MyPassword123!"
        },
        {
            "email": "david.brown@getcovered.io",
            "first_name": "David",
            "last_name": "Brown",
            "password": "StrongPass456#"
        },
        {
            "email": "emily.davis@getcovered.io",
            "first_name": "Emily",
            "last_name": "Davis",
            "password": "SafePass789$"
        },
        {
            "email": "chris.wilson@getcovered.io",
            "first_name": "Chris",
            "last_name": "Wilson",
            "password": "UserPass123!"
        },
        {
            "email": "amanda.taylor@getcovered.io",
            "first_name": "Amanda",
            "last_name": "Taylor",
            "password": "LoginPass456#"
        },
        {
            "email": "robert.anderson@getcovered.io",
            "first_name": "Robert",
            "last_name": "Anderson",
            "password": "AccessPass789$"
        },
        {
            "email": "lisa.thomas@getcovered.io",
            "first_name": "Lisa",
            "last_name": "Thomas",
            "password": "AdminPass123!"
        }
    ]
    
    for user_data in users:
        hashed_password = get_password_hash(user_data["password"])
        db_user = models.User(
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            hashed_password=hashed_password
        )
        db.add(db_user)
    
    db.commit()
    db.close()
    print("Database seeded successfully with 10 users!")

if __name__ == "__main__":
    seed_database()